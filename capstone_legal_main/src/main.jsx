import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Clauses from './pages/Clauses'
import Dashboard from './pages/Dashboard'
import QA from './pages/QA'
import Risk from './pages/Risk'
import Search from './pages/Search'
import Summarize from './pages/Summarize'
import Layout from './shared/Layout'


const router = createBrowserRouter([
{ element: <Layout/>, children: [
{ path: '/', element: <Dashboard/> },
{ path: '/summarize', element: <Summarize/> },
{ path: '/clauses', element: <Clauses/> },
{ path: '/risk', element: <Risk/> },
{ path: '/search', element: <Search/> },
{ path: '/qa', element: <QA/> },
]}
])


ReactDOM.createRoot(document.getElementById('root')).render(
<React.StrictMode>
<RouterProvider router={router}/>
</React.StrictMode>
)