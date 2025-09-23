import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Components/Home";
import Login from "./Authentication/Login";
import Register from "./Authentication/Register";
import Dashboard from "./Components/Dashboard";
import TaskBar from "./Components/TaskBar";
import Teams from "./Components/Teams";
import Workspace from "./Components/Workspace";
import ProtectedRoute from "./Route/ProtectedRoute";
import Unauthorized from "./Authentication/Unauthorized";
import NotFound from "./Authentication/NotFound";
import LeadSpace from "./Components/LeadSpace";
import Labellingworkspace from "./Components/Labellingworkspace";
import LabeledData from "./User/LabelledData";
import UserManagement from "./User/UserMangement";
import Annotator from "./User/Annotator";
import Labeled from "./User/Labelled";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>}></Route>
          <Route path="/login" element={<Login/>}></Route>
          <Route 
            path="/register" 
            element={
              <ProtectedRoute roles={["Admin"]}>
                <Register/>
              </ProtectedRoute>
            } 
          />
          <Route path="/unauthorized" element={<Unauthorized/>}></Route>
          <Route path="/leadspace" element={<LeadSpace/>}></Route>
         <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/taskbar"  element={
              <ProtectedRoute roles={["Member"]}>
                <TaskBar/>
              </ProtectedRoute>
            }></Route>
          <Route 
            path="/teams" 
            element={
              <ProtectedRoute roles={["Team Lead"]}>
                <Teams />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/labelleddata" 
            element={
              <ProtectedRoute roles={["Admin"]}>
                <LabeledData/>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/labelled" 
            element={
              <ProtectedRoute roles={["Admin"]}>
                <Labeled/>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/userActivity" 
            element={
              <ProtectedRoute roles={["Admin"]}>
                <UserManagement/>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/annotator" 
            element={
              <ProtectedRoute roles={["Member"]}>
                <Annotator/>
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
            <Route path="/workspace" element={<Workspace/>}></Route>
            <Route path="/labelling" element={<Labellingworkspace/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
