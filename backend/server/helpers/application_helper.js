exports.CurrentTermAndYear = CurrentTermAndYear
exports.getCurrentTerm = getCurrentTerm
exports.getInactive = getInactive
exports.getActive = getActive
exports.getNextYear = getNextYear
exports.getNextTerm = getCurrentTerm
exports.controller_before_auth_check_action = controller_before_auth_check_action
exports.getCurrent = getCurrent
exports.createCourse = createCourse
exports.getTeacherId = getTeacherId

const env = process.env.NODE_ENV || 'development'

const Sequelize = require('sequelize')
const https = require('https')
const axios = require('axios')
const config = require('./../config/config.js')[env]
const logger = require('../utils/logger')
const { CourseInstance, TeacherInstance, User } = require('../models')

const { Op } = Sequelize

/**
 *
 */
function controller_before_auth_check_action(req, res) {
  if (!req.authenticated.success) {
    res.status(401).end()
  }
}

/**
 *
 * @returns {{currentYear: string, currentTerm: string, nextTerm: string, nextYear: *}}
 * @constructor
 */
function CurrentTermAndYear() {
  const date = new Date()
  const month = date.getMonth() + 1
  const currentTerm = getCurrentTerm(month)
  const year = date.getFullYear()
  const currentYear = year.toString()
  const nextYear = getNextYear(currentTerm, year)
  const nextTerm = getNextTerm(currentTerm)
  return { currentYear, currentTerm, nextTerm, nextYear }
}

/**
 *
 * @param month
 * @returns {string}
 */
function getCurrentTerm(month) {
  if (1 <= month && month <= 5) {
    return 'K'
  } else if (6 <= month && month <= 8) {
    return 'V'
  } else if (9 <= month && month <= 12) {
    return 'S'
  } else {
    return null
  }
}

/**
 *
 * @param currentTerm
 * @param currentYear
 * @returns {*}
 */
function getNextYear(currentTerm, currentYear) {
  return currentTerm === 'S' ? (currentYear + 1) : currentYear
}

/**
 *
 * @param term
 * @returns {string}
 */
function getNextTerm(term) {
  switch (term) {
    case 'K':
      return 'V'
    case 'V':
      return 'S'
    case 'S':
      return 'K'
    default:
      return null
  }
}

/**
 *
 * @param year
 * @param term
 * @returns {{method: string, baseURL: string, headers: {'Content-Type': string, Authorization: string}, httpsAgent: "https".Agent}}
 */
function axiosBlaBla(year, term) {
  return {
    method: 'get',
    baseURL: `${config.kurki_url}/labtool/courses?year=${year}&term=${term}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: process.env.TOKEN
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false // if you don't like this then please go ahead and do it yourself better.
    })
  }
}

/**
 *
 * @param hid
 * @returns {{method: string, baseURL: string, headers: {'Content-Type': string, Authorization: string}, httpsAgent: "https".Agent}}
 */
function axiosCourseBla(hid) {
  return {
    method: 'get',
    baseURL: `${config.kurki_url}/labtool/courses/${hid}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: process.env.TOKEN
    },
    params: {
      testing: process.env.INCLUDE_TESTERS // Set the environment variable if you want to include test users from Kurki.
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false // if you don't like this then please go ahead and do it yourself better.
    })
  }
}

/**
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function getTeacherId(userId, courseInstanceId) {
  const teacher = await TeacherInstance.findOne({
    attributes: ['id'],
    where: {
      userId,
      courseInstanceId
    }
  })

  return teacher ? teacher.id : null
}

/**
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function getActive(req, res) {
  try {
    return await CourseInstance.findAll({
      order: [['createdAt', 'DESC']]
    })
  } catch (e) {
    return e
  }
}

/**
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function getInactive(req, res) {
  try {
    const cur = await getCurrent(req, res)
    const nxt = await getNewer(req, res)
    const newobj = await cur.concat(nxt)
    const iarr = []
    for (const blob in newobj) {
      iarr.push(newobj[blob].id)
    }

    const ires = await CourseInstance.findAll({
      where: {
        ohid: { [Op.in]: iarr }
      }
    })
    const notactivated = []

    for (const i in newobj) {
      let found = 0
      for (const j in ires) {
        if (newobj[i].id === ires[j].ohid) {
          found = 1
        }
      }
      if (found === 0) {
        notactivated.push(newobj[i])
      }
    }

    return notactivated
  } catch (e) {
    return e
  }
}

/**
 *
 * @param body
 * @returns {Promise<*>}
 */
async function createCourse(body) {
  const options = await axiosCourseBla(body.hid)
  try {
    const result = await axios
      .create(options)
      .get()
      .then(barf => barf.data)
    const newCourse = await CourseInstance.build({
      name: body.cname,
      start: body.starts,
      end: body.ends,
      ohid: body.hid
    }).save()

    if (result.teachers.length > 0) {
      for (let i = 0; i < result.teachers.length; ++i) {
        const user = await User.findOrCreate({
          where: {
            username: result.teachers[i]
          },
          defaults: {
            username: result.teachers[i],
            admin: true
          }
        })
        TeacherInstance.build({
          userId: user[0].id,
          courseInstanceId: newCourse.id,
          admin: true
        }).save()
      }
    }
    return result
  } catch (error) {
    logger.error('createCourse error', { error: error.message })
  }
}

/**
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function getCurrent(req, res) {
  const timeMachine = CurrentTermAndYear()
  const options = await axiosBlaBla(timeMachine.currentYear, timeMachine.currentTerm)
  try {
    const result = await axios
      .create(options)
      .get()
      .then(barf => barf.data)
    return result
  } catch (error) {
    logger.error('getCurrent error', { error: error.message })
  }
}

/**
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function getNewer(req, res) {
  const timeMachine = CurrentTermAndYear()
  const options = await axiosBlaBla(timeMachine.nextYear, timeMachine.nextTerm)
  try {
    const result = await axios
      .create(options)
      .get()
      .then(barf => barf.data)
    return result
  } catch (error) {
    logger.error('getNewer error', { error: error.message })
  }
}
