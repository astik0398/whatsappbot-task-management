import logo from './logo.svg';
import './App.css';
import UploadFile from './components/UploadFile';
import MainRoute from './AllRoutes/MainRoute';
import Navbar from './AllRoutes/Navbar';

function App() {
  return (
    <div className="App">
      <Navbar/>
     <MainRoute/>
    </div>
  );
}

export default App;
