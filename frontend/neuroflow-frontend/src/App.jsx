import WaterLog from './components/WaterLog.jsx';
import MealLog from "./components/MealLog";
import WorkoutLog from './components/WorkoutLog.jsx';
import PomodoroTracker from './components/PomodoroTracker.jsx';
// function App() {
//   return (
//     <div className="bg-gray-100 min-h-screen">
//       <MealLog />
//     </div>
//   );
// }

// export default App;

import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <>
      <PomodoroTracker />
      {/* <WaterLog />
      <MealLog />
      <WorkoutLog /> */}
      <ToastContainer position="top-center" autoClose={2500} />
    </>
  );
}


export default App;