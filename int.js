import { useState, useEffect } from "react";
import axios from "axios";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    if (!user) return;
    const response = await axios.get("http://localhost:8000/tasks/");
    setTasks(response.data);
  };

  const addTask = async () => {
    if (!title || !description || !user) return;
    await axios.post("http://localhost:8000/tasks/", { title, description });
    setTitle("");
    setDescription("");
    fetchTasks();
  };

  const deleteTask = async (id) => {
    if (!user) return;
    await axios.delete(`http://localhost:8000/tasks/${id}`);
    fetchTasks();
  };

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setTasks([]);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-4">Task Manager</h1>
      {!user ? (
        <button onClick={handleLogin} className="w-full bg-green-500 text-white p-2 rounded">
          Login with Google
        </button>
      ) : (
        <>
          <button onClick={handleLogout} className="w-full bg-gray-500 text-white p-2 rounded mb-4">
            Logout
          </button>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <button onClick={addTask} className="w-full bg-blue-500 text-white p-2 rounded">
            Add Task
          </button>
          <ul className="mt-4">
            {tasks.map((task) => (
              <li key={task.id} className="flex justify-between items-center p-2 border rounded mb-2">
                <div>
                  <h2 className="font-bold">{task.title}</h2>
                  <p>{task.description}</p>
                </div>
                <button onClick={() => deleteTask(task.id)} className="bg-red-500 text-white p-1 rounded">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
