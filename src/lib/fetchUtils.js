const fetchTodos = async () => {
    try {
      const response = await fetch("http://localhost:8080/it-bkk/v1/tasks");
      const data = await response.json();
      todos.value = data.sort(
        (a, b) => new Date(b.createdOn) - new Date(a.createdOn)
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  const deleteTodoById = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/it-bkk/v1/tasks/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      showDeleteModal.value = false;
      selectedDeletedTodo.value = null;
      await fetchTodos(); // Add await here
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  const fetchDataById = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/it-bkk/v1/tasks/${id}`);
      const selectedData = await response.json();
      selectedTodo.value = selectedData;
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  const addTodo = async (newTodo, todos) => {
    newTodo.id = todos.length + 1;
    newTodo.createdOn = new Date().toISOString().slice(0, 19).replace("T", " ");
    newTodo.updatedOn = new Date().toISOString().slice(0, 19).replace("T", " ");
    try {
      const response = await fetch("http://localhost:8080/it-bkk/v1/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTodo),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      todos.push(data);
    } catch (error) {
      console.error("Error:", error);
    }
    return todos;
  };

  export { fetchTodos, deleteTodoById, fetchDataById, addTodo };