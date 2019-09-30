import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Grid, Loader } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { createStudentCourses, updateStudentProjectInfo } from '../../services/studentinstances'
import { resetLoading, addRedirectHook } from '../../reducers/loadingReducer'
import { Redirect } from 'react-router'
import { getOneCI } from '../../services/courseInstance'

/**
 * The page user uses to register to a course AS A STUDENT
 */

export const RegisterPage = props => {
  useEffect(() => {
    // run on component mount
    props.resetLoading()
    props.getOneCI(props.courseId)
  }, [])

  const handleSubmit = async e => {
    try {
      e.preventDefault()
      if (props.coursePage && props.coursePage.data !== null) {
        const data = {
          projectname: e.target.projectName.value,
          github: e.target.github.value,
          ohid: props.selectedInstance.ohid
        }
        props.addRedirectHook({
          hook: 'STUDENT_PROJECT_INFO_UPDATE_'
        })
        await props.updateStudentProjectInfo(data)
      } else {
        const content = {
          projectName: e.target.projectName.value,
          github: e.target.github.value,
          ohid: props.selectedInstance.ohid
        }
        props.addRedirectHook({
          hook: 'STUDENT_COURSE_CREATE_ONE_'
        })
        await props.createStudentCourses(content, props.selectedInstance.ohid)
      }
    } catch (error) {
      console.error(error)
    }
  }

  if (props.loading.redirect) {
    return <Redirect to={`/labtool/courses/${props.selectedInstance.ohid}`} />
  }

  return (
    <div
      className="RegisterPage"
      style={{
        textAlignVertical: 'center',
        textAlign: 'center'
      }}
    >
      <Loader active={props.loading.loading} inline="centered" />
      <Grid>
        <Grid.Row centered>
          {props.coursePage && props.coursePage.data !== null ? (
            <div>
              <h3>Update your info for {props.selectedInstance.name}</h3>
            </div>
          ) : (
            <div>
              <h3>Register for {props.selectedInstance.name}</h3>
            </div>
          )}
        </Grid.Row>
      </Grid>

      <Grid>
        <Grid.Row centered>
          <Form onSubmit={handleSubmit}>
            <Form.Group inline>
              <label style={{ width: '100px', textAlign: 'left' }}>Project name</label>
              <Input icon="rocket" iconPosition="left" type="text" className="form-control1" name="projectName" placeholder="MyProjectName" required style={{ minWidth: '30em' }} />
            </Form.Group>

            <Form.Group inline>
              <label style={{ width: '100px', textAlign: 'left' }}>GitHub link</label>
              <Input icon="github" iconPosition="left" type="url" className="form-control2" name="github" placeholder="https://github.com/myaccount/myrepo" required style={{ minWidth: '30em' }} />
            </Form.Group>

            <Form.Field>
              <button className="ui left floated blue button" type="submit">
                {' '}
                Submit
              </button>
              <Link to={`/labtool/courses/${props.selectedInstance.ohid}`}>
                {' '}
                <button className="ui right floated button" type="Cancel">
                  Cancel
                </button>
              </Link>
            </Form.Field>
          </Form>
        </Grid.Row>
      </Grid>
    </div>
  )
}

const mapStateToProps = (state, ownProps) => {
  return {
    coursePage: state.coursePage,
    selectedInstance: state.selectedInstance,
    courseId: ownProps.courseId,
    loading: state.loading
  }
}

const mapDispatchToProps = {
  createStudentCourses,
  updateStudentProjectInfo,
  getOneCI,
  resetLoading,
  addRedirectHook
}

RegisterPage.propTypes = {
  courseId: PropTypes.string.isRequired,

  coursePage: PropTypes.object.isRequired,
  selectedInstance: PropTypes.object.isRequired,
  loading: PropTypes.object.isRequired,

  createStudentCourses: PropTypes.func.isRequired,
  updateStudentProjectInfo: PropTypes.func.isRequired,
  getOneCI: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired,
  addRedirectHook: PropTypes.func.isRequired
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RegisterPage)
