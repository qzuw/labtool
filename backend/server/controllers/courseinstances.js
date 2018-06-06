const db = require('../models')
const CourseInstance = require('../models').CourseInstance
const StudentInstance = require('../models').StudentInstance
const TeacherInstance = require('../models').TeacherInstance
const User = require('../models').User
const helper = require('../helpers/course_instance_helper')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const StudentInstanceController = require('../controllers').studentInstances
const Week = require('../models').Week
const CodeReview = require('../models').CodeReview
const Comment = require('../models').Comment
const env = process.env.NODE_ENV || 'development'
const config = require('./../config/config.js')[env]

module.exports = {
  /**
   *
   * @param req
   * @param res
   */
  findByUserTeacherInstance(req, res) {
    helper.controller_before_auth_check_action(req, res)
    const errors = []
    console.log('***REQ BODY***: ', req.body)

    const id = parseInt(req.body.userId) //TODO: CHECK THAT THIS IS SANITICED ID
    console.log('TOKEN VERIFIED: ', req.authenticated)
    console.log('token.data.id: ', req.decoded.id)
    db.sequelize
      .query(`SELECT * FROM "CourseInstances" JOIN "TeacherInstances" ON "CourseInstances"."id" = "TeacherInstances"."courseInstanceId" WHERE "TeacherInstances"."userId" = ${req.decoded.id}`)
      .then(instance => res.status(200).send(instance[0]))
      .catch(error => res.status(400).send(error))
  },
  /**
   *
   * @param req
   * @param res
   * @returns {Promise<void>}
   */
  async coursePage(req, res) {
    helper.controller_before_auth_check_action(req, res)

    const course = await CourseInstance.findOne({
      where: {
        ohid: req.body.course
      }
    })
    const courseInst = course.id
    const palautus = {
      role: 'Unregistered',
      data: undefined
    }
    const user = req.decoded.id
    console.log('user.id: ', user)
    const teacher = await TeacherInstance.findAll({
      where: {
        userId: user,
        courseInstanceId: courseInst
      }
    })
    if (teacher[0] === undefined) {
      console.log('studentti')
      console.log('userId: ', user)
      console.log('courseInstanceId:', courseInst)
      const student = await StudentInstance.find({
        where: {
          userId: user,
          courseInstanceId: courseInst
        },
        include: [
          {
            model: Week,
            as: 'weeks',
            include: [
              {
                model: Comment,
                as: 'comments',
                where: {
                  hidden: false
                },
                required: false
              }
            ]
          },
          {
            model: CodeReview,
            as: 'codeReviews',
            where: {
              reviewNumber: {
                [Op.gte]: course.currentCodeReview
              }
            },
            required: false
          },
          {
            model: User
          }
        ]
      })
      console.log('studentInst: ', student)

      try {
        palautus.data = student
        palautus.role = 'student'
        res.status(200).send(palautus)
      } catch (error) {
        res.status(400).send(error)
      }
    } else {
      const teacherPalautus = await StudentInstance.findAll({
        where: {
          courseInstanceId: courseInst
        },
        include: [
          {
            model: Week,
            as: 'weeks',
            include: [
              {
                model: Comment,
                as: 'comments'
              }
            ]
          },
          {
            model: CodeReview,
            as: 'codeReviews'
          },
          {
            model: User
          }
        ]
      })
      try {
        palautus.data = teacherPalautus
        palautus.role = 'teacher'
        res.status(200).send(palautus)
      } catch (e) {
        res.status(200).send(e)
      }
    }
  },

  /**
   *
   * @param req
   * @param res
   */
  findByUserStudentInstance(req, res) {
    helper.controller_before_auth_check_action(req, res)
    helper.findByUserStudentInstance(req, res)
  },

  /**
   *
   * @param req
   * @param res
   */
  registerToCourseInstance(req, res) {
    helper.controller_before_auth_check_action(req, res)
    console.log(`---------------------------------`);
    console.log(req.decoded)
    console.log(`---------------------------------`);

    CourseInstance.findOne({
      where: {
        ohid: req.params.ohid
      }
    }).then(course => {
      if (!course) {
        return res.status(400).send({
          message: 'course instance not found'
        })
      } else if (course.active === false) {
        console.log('course is no active')
        return res.status(400).send({
          message: 'course is not active'
        })
      }
      User.findById(req.decoded.id).then(user => {
        if (!user) {
          return res.status(400).send({
            message: 'something went wrong (clear these specific error messages later): user not found'
          })
        }
        let promisingThatWeboodiStatusIsChecked = new Promise((resolve, reject) => {
          console.log('user.studentNumber', user.studentNumber)
          helper.checkWebOodi(req, res, user, resolve) // this does not work.

          setTimeout(function() {
            resolve('shitaintright') // Yay! everything went to hell.
          }, 5000) // set a high timeout value since you really want to wait x)
        })

        promisingThatWeboodiStatusIsChecked.then(barf => {
          console.log('Yay! ' + barf)
          console.log(req.body)

          if (barf === 'found') {
            StudentInstance.findOrCreate({
              where: {
                userId: user.id,
                courseInstanceId: course.dataValues.id
              },
              defaults: {
                userId: user.id,
                name: user,
                courseInstanceId: course.dataValues.id,
                github: req.body.github || '', // model would like to validate this to be an URL but seems like crap
                projectName: req.body.projectName || '' // model would like to validate this to alphanumeric but seems like this needs specific nulls or empties or whatever
              }
            })
              .then(student => {
                if (!student) {
                  res.status(400).send({
                    message: 'something went wrong: if somehow we could not find or create a record we see this'
                  })
                } else {
                  helper.findByUserStudentInstance(req, res)

                  //      this.findByUserStudentInstance(req,res)
                  //                  res.status(200).send({

                  /*
                  message: 'something went right',
                  whatever: student
                })*/
                }
              })
              .catch(function(error) {
                res.status(400).send({
                  message: error.errors
                })
              })
          } else {
            res.status(400).send({
              message: 'something went wrong'
            })
          }
        })
      })
    })
  },

  /**
   *
   * @param req
   * @param res
   * @returns {*|Promise<T>}
   */
  update(req, res) {
    helper.controller_before_auth_check_action(req, res)

    console.log('REQ body: ', req.body)
    console.log('REQ params: ', req.params)
    return CourseInstance.find({
      where: {
        ohid: req.params.id
      }
    })
      .then(courseInstance => {
        if (!courseInstance) {
          res.status(400).send({
            message: 'course instance not found'
          })
        }
        return courseInstance
          .update({
            name: req.body.name || courseInstance.name,
            start: req.body.start || courseInstance.start,
            end: req.body.end || courseInstance.end,
            active: req.body.active || courseInstance.active,
            weekAmount: req.body.weekAmount || courseInstance.weekAmount,
            weekMaxPoints: req.body.weekMaxPoints || courseInstance.weekMaxPoints,
            currentWeek: req.body.currentWeek || courseInstance.currentWeek
          })
          .then(updatedCourseInstance => res.status(200).send(updatedCourseInstance))
          .catch(error => res.status(400).send(error))
      })
      .catch(error => res.status(400).send(error))
  },

  /**
   *
   * @param req
   * @param res
   * @returns {Promise<Array<Model>>}
   */
  list(req, res) {
    return CourseInstance.findAll()
      .then(instance => res.status(200).send(instance))
      .catch(error => res.status(400).send(error))
  },

  /**
   *
   * @param req
   * @param res
   */
  retrieve(req, res) {
    helper.controller_before_auth_check_action(req, res)

    const errors = []
    CourseInstance.find(
      {
        where: {
          ohid: req.params.ohid
        }
      },
      {}
    )
      .then(courseInstance => {
        if (!courseInstance) {
          return res.status(404).send({
            message: 'Course not Found'
          })
        }
        return res.status(200).send(courseInstance)
      })
      .catch(error => res.status(400).send(error))
  },
  /**
   *
   * @param req
   * @param res
   */
  getNew(req, res) {
    helper.controller_before_auth_check_action(req, res)

    const termAndYear = helper.CurrentTermAndYear()
    console.log('term and year: ', termAndYear)
    if (this.remoteAddress === '127.0.0.1') {
      res.send('gtfo')
    } else {
      const request = require('request')
      const options = {
        method: 'get',
        uri: `${config.kurki_url}/labtool/courses?year=${termAndYear.currentYear}&term=${termAndYear.currentTerm}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: process.env.TOKEN
        },
        strictSSL: false
      }
      request(options, function(err, resp, body) {
        const json = JSON.parse(body)
        console.log('json palautta...')
        console.log(json)
        json.forEach(instance => {
          CourseInstance.findOrCreate({
            where: { ohid: instance.id },
            defaults: {
              name: instance.name,
              start: instance.starts,
              end: instance.ends,
              ohid: instance.id
            }
          })
        })
        if (req.decoded) {
          res.status(204).send({ hello: 'hello' }) // nodejs crashes if someone just posts here without valid token.
        }
      })
    }
  },

  /**
   *
   * @param req
   * @param res
   */
  getNewer(req, res) {
    helper.controller_before_auth_check_action(req, res)

    console.log('update next...')
    const auth = process.env.TOKEN || 'notset' //You have to set TOKEN in .env file in order for this to work
    const termAndYear = helper.CurrentTermAndYear()
    console.log('term and year: ', termAndYear)
    if (auth === 'notset') {
      res.send('Please restart the backend with the correct TOKEN environment variable set')
    } else {
      if (this.remoteAddress === '127.0.0.1') {
        res.send('gtfo')
      } else {
        const request = require('request')
        const options = {
          method: 'get',
          uri: `${config.kurki_url}/labtool/courses?year=${termAndYear.nextYear}&term=${termAndYear.nextTerm}`,
          headers: {
            'Content-Type': 'application/json',
            Authorization: process.env.TOKEN
          },
          strictSSL: false
        }
        request(options, function(err, resp, body) {
          const json = JSON.parse(body)
          console.log(json)
          json.forEach(instance => {
            CourseInstance.findOrCreate({
              where: { ohid: instance.id },
              defaults: {
                name: instance.name,
                start: instance.starts,
                end: instance.ends,
                ohid: instance.id
              }
            })
          })
          if (req.decoded) {
            res.status(204).send({ hello: 'hello' }) // nodejs crashes if someone just posts here without valid token.
          }
        })
      }
    }
  },

  /**
   *
   * @param req
   * @param res
   * @returns {Promise<Model>}
   */
  async retrieveCourseStuff(req, res) {
    await helper.controller_before_auth_check_action(req, res)

    if (req.authenticated.success) {
      try {
        const currentUser = await User.findById(req.decoded.id)

        if (!currentUser) {
          return res.status(404).send('User not found')
        }

        let checkRegistrationStatus = new Promise((resolve, reject) => {
          helper.checkWebOodi(req, res, currentUser, resolve)
          setTimeout(function() {
            resolve('failure')
          }, 5000)
        })

        const registrationAtWebOodi = await checkRegistrationStatus

        const course = await CourseInstance.findOne({
          where: {
            ohid: req.params.ohid
          }
        })

        if (!course) {
          return res.status(404).send('Course not found')
        }

        let teachers = await TeacherInstance.findAll({
          where: {
            courseInstanceId: course.id
          }
        })

        const names = {}
        const users = await User.findAll()
        users.forEach(user => {
          names[user.id] = {
            firsts: user.firsts,
            lastname: user.lastname
          }
        })

        teachers = teachers.map(teacher => {
          teacher.dataValues.firsts = names[teacher.userId].firsts
          teacher.dataValues.lastname = names[teacher.userId].lastname
          return teacher
        })

        console.log(teachers)

        course.dataValues['teacherInstances'] = teachers
        course.dataValues['registrationAtWebOodi'] = registrationAtWebOodi

        return res.status(200).send(course)
      } catch (exception) {
        return res.status(400).send(exception)
      }
    }
  },

  /**
   *
   * @param req
   * @param res
   * @returns {*|Promise<T>}
   */
  addComment(req, res) {
    helper.controller_before_auth_check_action(req, res)

    const message = req.body
    return Comment.create({
      weekId: message.week,
      hidden: message.hidden,
      comment: message.comment,
      from: message.from
    })
      .then(comment => {
        if (!comment) {
          res.status(400).send('week not found')
        } else {
          res.status(200).send(comment)
        }
      })
      .catch(error => res.status(400).send(error))
  },

  /**
   *
   * @param req
   * @param res
   * @returns {Promise<Array<Model>>}
   */
  getCommentsForWeek(req, res) {
    helper.controller_before_auth_check_action(req, res)

    return Comment.findAll({
      where: {
        weekId: req.body.week
      }
    })
      .then(comment => res.status(200).send(comment))
      .catch(error => res.status(400).send(error))
  }
}
