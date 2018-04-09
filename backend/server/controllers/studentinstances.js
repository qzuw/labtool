const StudentInstance = require('../models').StudentInstance
const jwt = require('jsonwebtoken')
const db = require('../models')

module.exports = {
  create(req, res) {
    const errors = []
    return (
      StudentInstance
        .findOrCreate({
          where: { userId: req.decoded.id, courseInstanceId: req.body.courseInstanceId },
          defaults: {
            github: req.body.github,
            projectName: req.body.projectName,
            userId: req.decoded.id,
            courseInstanceId: req.body.courseInstanceId
          }
        })
        .spread((si, created) => {
          if (created) {
            errors.push('You are not registered to course in WebOodi')
            res.status(200).send(errors)
          }
          res.status(200).send(si)
        })
        .catch(error => res.status(400).send(error))
    )
  },
  list(req, res) {
    return StudentInstance
      .all()
      .then(ui => res.status(200).send(ui))
      .catch(error => res.status(400).send(error))
  },
  update(req, res) {
    return StudentInstance
      .find({
        where: {
          studentInstanceId: req.params.id,
        }
      })
      .then(studentInstance => {
        if (!studentInstance) {
          return res.status(400).send({
            message: 'Student instance not found',
          })
        }
        return studentInstance
          .update({
            name: req.body.name || studentInstance.name,
            github: req.body.github || studentInstance.github,
            projectName: req.body.projectName || studentInstance.projectName
          })
          .then(updatedStudentInstance => res.status(200).send(updatedStudentInstance))
          .catch(error => res.status(400).send(error))
      })
      .catch(error => res.status(400).send(error))
  },
  destroy(req, res) {
    return StudentInstance
      .find({
        where: {
          id: req.params.id,
        },
      })
      .then(studentInstance => {
        if (!studentInstance) {
          return res.status(400).send({
            message: 'Student instance not found',
          })
        }
        return studentInstance
          .destroy()
          .then(() => res.status(204).send())
          .catch(error => res.status(400).send(error))
      })
      .catch(error => res.status(400).send(error))
  },

  findByCourseInst(req, res) {
    console.log('BEEB BOOP')
    // console.log('ohid: ', req.params.ohid)
    //return StudentInstance
    db.sequelize.query(`SELECT * FROM "StudentInstances" AS SI 
    JOIN "CourseInstances" AS CI ON SI.id = CI.id 
    WHERE CI."ohid" = '${req.params.ohid}'`)
      .then(studentInst =>
        res.status(200).send(studentInst[0]))
      .catch(error => res.status(400).send(error))
  },

  retrieve(req, res) {
    return StudentInstance
      .findById(req.params.id, {})
      .then(studentInstance => {
        if (!studentInstance) {
          return res.status(404).send({
            message: 'Student Instance not Found',
          })
        }
        return res.status(200).send(studentInstance)
      })
      .catch(error => res.status(400).send(error))
  },
}
