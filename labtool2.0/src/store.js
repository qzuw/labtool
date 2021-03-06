import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import { handleRequest } from './util/apiConnection'

import courseInstance from './reducers/courseInstanceReducer'
import login from './reducers/loginReducer'
import users from './reducers/userReducer'
import notification from './reducers/notificationReducer'
import teacherInstance from './reducers/teacherInstanceReducer'
import studentInstance from './reducers/studentInstanceReducer'
import selectedInstance from './reducers/selectedInstanceReducer'
import coursePage from './reducers/coursePageReducer'
import coursePageLogic from './reducers/coursePageLogicReducer'
import codeReviewLogic from './reducers/codeReviewReducer'
import checklist from './reducers/checklistReducer'
import tagsReducer from './reducers/tagReducer'
import weekReview from './reducers/weekReviewReducer'
import loading from './reducers/loadingReducer'
import redirect from './reducers/redirectReducer'
import courseImport from './reducers/courseImportReducer'

/**
 * The store, that takes all the redux reducers. Index imports it.
 * It also uses middlewares, the most important being apiConnection, named
 * handleRequest.
 *
 * All the reducers need to be added here.
 */
const reducer = combineReducers({
  courseInstance: courseInstance,
  user: login,
  notification: notification,
  teacherInstance: teacherInstance,
  studentInstance: studentInstance,
  selectedInstance: selectedInstance,
  coursePage: coursePage,
  users: users,
  coursePageLogic: coursePageLogic,
  codeReviewLogic: codeReviewLogic,
  checklist: checklist,
  tags: tagsReducer,
  loading: loading,
  weekReview: weekReview,
  redirect: redirect,
  courseImport: courseImport
})

const compose = process.env.NODE_ENV === 'production' ? store => store : store => composeWithDevTools(store)

const store = createStore(reducer, compose(applyMiddleware(thunk, handleRequest)))

export default store
