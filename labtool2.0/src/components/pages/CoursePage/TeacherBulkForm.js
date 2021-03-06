import React from 'react'
import PropTypes from 'prop-types'
import { Accordion, Button, Icon, Dropdown, Grid, Popup } from 'semantic-ui-react'
import { usePersistedState } from '../../../hooks/persistedState'

export const CoursePageTeacherBulkForm = props => {
  const {
    coursePageLogic,
    courseId,
    dropDownTags,
    dropDownTeachers,
    changeSelectedTag,
    changeSelectedTeacher,
    bulkAddTag,
    bulkRemoveTag,
    bulkUpdateTeacher,
    bulkMarkDropped,
    bulkMarkNotDropped,
    bulkMarkValid,
    bulkMarkInvalid
  } = props
  const state = usePersistedState(`CoursePage-ModifySelectedStudents-${courseId}`, { showPanel: false })
  const numSelected = Object.keys(coursePageLogic.selectedStudents).length
  const disabled = numSelected < 1

  return (
    <span className="TeacherBulkForm" style={{ position: 'fixed', bottom: 0, background: 'rgba(255,255,255,0.9)', textAlign: 'center', left: 0, right: 0 }}>
      <Accordion>
        <Accordion.Title style={{ background: '#f0f0f0' }} active={state.showPanel} index={0} onClick={() => (state.showPanel = !state.showPanel)}>
          <Icon size="big" name={state.showPanel ? 'caret down' : 'caret up'} />
          <h4 style={{ display: 'inline' }}>Modify selected students</h4> ({numSelected > 0 ? <b>{numSelected} selected</b> : <span>{numSelected} selected</span>})
        </Accordion.Title>
        <Accordion.Content active={state.showPanel}>
          <br />
          <Grid columns={2} divided style={{ width: '90%', display: 'inline-block' }}>
            <Grid.Row>
              <Grid.Column>
                <Dropdown
                  id="tagDropdown"
                  style={{ float: 'left', display: 'inline', width: '48%' }}
                  options={dropDownTags}
                  disabled={disabled}
                  onChange={changeSelectedTag}
                  placeholder="Choose tag"
                  fluid
                  selection
                />
                <div className="two ui buttons" style={{ float: 'right', display: 'inline', width: '48%' }}>
                  <button
                    className="ui icon positive button"
                    disabled={disabled}
                    onClick={() => {
                      bulkAddTag()
                      state.showPanel = false
                    }}
                    size="mini"
                  >
                    <i className="plus icon" />
                  </button>
                  <div className="or" style={{ display: 'inline' }} />
                  <button
                    className="ui icon button"
                    disabled={disabled}
                    onClick={() => {
                      bulkRemoveTag()
                      state.showPanel = false
                    }}
                    size="mini"
                  >
                    <i className="trash icon" />
                  </button>
                </div>
              </Grid.Column>
              <Grid.Column>
                <Dropdown
                  id="assistantDropdown"
                  options={dropDownTeachers}
                  disabled={disabled}
                  onChange={changeSelectedTeacher}
                  placeholder="Select teacher"
                  fluid
                  selection
                  style={{ float: 'left', display: 'inline', width: '48%' }}
                />
                <Button
                  style={{ float: 'right', display: 'inline', width: '48%' }}
                  disabled={disabled}
                  onClick={() => {
                    bulkUpdateTeacher()
                    state.showPanel = false
                  }}
                  size="small"
                >
                  Change instructor
                </Button>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <Button
                  style={{ float: 'left', display: 'inline', width: '48%' }}
                  disabled={disabled}
                  onClick={() => {
                    bulkMarkNotDropped()
                    state.showPanel = false
                  }}
                >
                  Mark as non-dropped
                </Button>
                <Button
                  style={{ float: 'right', display: 'inline', width: '48%' }}
                  disabled={disabled}
                  color="red"
                  onClick={() => {
                    bulkMarkDropped()
                    state.showPanel = false
                  }}
                >
                  Mark as dropped
                </Button>
              </Grid.Column>
              <Grid.Column>
                <Button
                  style={{ float: 'left', display: 'inline', width: '48%' }}
                  disabled={disabled}
                  onClick={() => {
                    bulkMarkValid()
                    state.showPanel = false
                  }}
                >
                  Intended course registration
                </Button>
                <Popup
                  content="Mark a registration as mistaken, if the student accidentally registered onto the course"
                  trigger={
                    <Button
                      style={{ float: 'right', display: 'inline-block', width: '48%' }}
                      disabled={disabled}
                      basic
                      color="red"
                      onClick={() => {
                        bulkMarkInvalid()
                        state.showPanel = false
                      }}
                    >
                      Mistaken course registration
                    </Button>
                  }
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <br />
        </Accordion.Content>
      </Accordion>
      <br />
    </span>
  )
}

CoursePageTeacherBulkForm.propTypes = {
  coursePageLogic: PropTypes.object.isRequired,
  courseId: PropTypes.string.isRequired,
  dropDownTags: PropTypes.array.isRequired,
  dropDownTeachers: PropTypes.array.isRequired,

  changeSelectedTag: PropTypes.func.isRequired,
  changeSelectedTeacher: PropTypes.func.isRequired,
  bulkAddTag: PropTypes.func.isRequired,
  bulkRemoveTag: PropTypes.func.isRequired,
  bulkUpdateTeacher: PropTypes.func.isRequired,
  bulkMarkDropped: PropTypes.func.isRequired,
  bulkMarkNotDropped: PropTypes.func.isRequired,
  bulkMarkValid: PropTypes.func.isRequired,
  bulkMarkInvalid: PropTypes.func.isRequired
}

export default CoursePageTeacherBulkForm
