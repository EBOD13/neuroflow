// import WaterLog from './components/WaterLog.jsx';
// import MealLog from "./components/MealLog";
// import WorkoutLog from './components/WorkoutLog.jsx';
// import PomodoroTracker from './components/PomodoroTracker.jsx';
// import PomodoroAnalytics from './components/PomodoAnalytics.jsx';
// import RegularTimer from './components/RegularTimer.jsx';
// import SleepTracker from './components/SleepTracker.jsx';
// import TaskTracker from './components/TaskTracker.jsx';
// import TaskBoard from './components/TaskBoard.jsx';
// import GoalCreator from './components/GoalCreator.jsx';
// import Progress from './components/Progress.jsx';
// import GoalDetail from './components/GoalDetail';
// // function App() {
// //   return (
// //     <div className="bg-gray-100 min-h-screen">
// //       <MealLog />
// //     </div>
// //   );
// // }

// // export default App;

// import 'react-toastify/dist/ReactToastify.css';
// import { ToastContainer } from 'react-toastify';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';

// function App() {
// //   return (
// //     <>
// //       {/* <SleepTracker /> */}
// //       {/* <TaskTracker /> */}
// //       {/* <TaskBoard /> */}
// //       <Progress />
// //       <GoalCreator />
// //       {/* <PomodoroAnalytics /> */}
// //       {/* <RegularTimer /> */}
// //       {/* <WaterLog />
// //       <MealLog />
// //       <WorkoutLog /> */}
// //       <ToastContainer position="top-center" autoClose={2500} />
// //     </>
// //   );
// // }

//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<GoalDetail />} />
//          {/* <Route path="/goals/:goalId" element={<GoalDetail />} /> */}
//       </Routes>
//     </BrowserRouter>
//   );
// }
// export default App;




// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import GoalDetail from './components/GoalDetail';
// import GoalCreator from './components/GoalCreator';
// import Progress from './components/Progress';
// import TaskBoard from './components/TaskBoard'; // ✅ import this

// function App() {
//   return (
//     <BrowserRouter>
//       <div className="min-h-screen bg-gray-50 text-gray-800">
//         <Routes>
//           <Route path="/" element={<Progress />} />
//           <Route path="/goals/:goalId" element={<GoalDetail />} />
//           <Route path="/create-goal" element={<GoalCreator />} />
//           <Route path="/tasks" element={<TaskBoard />} /> {/* ✅ new route */}
//         </Routes>
//       </div>
//     </BrowserRouter>
//   );
// }

// export default App;

import React from 'react';
// import IconPicker from './components/IconPicker';

// function App() {
//   return (
//     <div className="App">
//       <IconPicker />
//     </div>
//   );
// }

// export default App;


// TEMPERATURE
import TemperatureDial from './components/TemperatureDial';

function App() {
  return <TemperatureDial />;
}

export default App;


