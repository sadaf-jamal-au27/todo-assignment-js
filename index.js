var todoList = {
  todos : [],

  addTodo: function(todoName,todoName1, array, indexToInsertIn){
    
    array.splice(indexToInsertIn,0,{
      todoName: [todoName ,todoName1],
      completed:false,
      children: [],
      id: util.uuid(),
      collapsed: false,
      parent: (array + "").replace(".children", ""),
    })
    return array[indexToInsertIn].id
  },
  editTodo: function(todo, newTodoName){
    todo.todoName = newTodoName;
  },
  deleteTodo: function(indexOfTodo, array){
    array.splice(indexOfTodo,1);
  },
  toggleTodo: function(todo, toggleFlag){

    if(todo.completed === false || toggleFlag === true){
      todo.completed = true;
    }else{
      todo.completed = false;
    }

    for(var i=0; i< todo.children.length;i++){
      this.toggleTodo(todo.children[i], toggleFlag);
    }
  },
  toggleAll: function(){
 
    var toggleFlag = this.checkTodos(this.todos);
  
    for(var i=0; i < this.todos.length; i++){
      this.toggleTodo(this.todos[i], toggleFlag);
    }
  },
  
  checkTodos: function(array){
    var toggleFlag = false
   
    for(var i=0; i< array.length; i++){
      if(array[i].completed === false) return toggleFlag = true;
    
      if(array[i].children.length > 0){
        this.checkTodos(array[i].children)
      }
    }
    return toggleFlag;
  },
  clearCompleted: function(array){
    for(var i=array.length - 1; i >= 0; i--){
      if(array[i].completed === true){
        todoList.deleteTodo(i, array);
      }
      if(array[i] !== undefined && array[i].children.length > 0){
        this.clearCompleted(array[i].children)
      }
    }
  },
  clearAll: function(){
    this.todos=[];
  },
}

var handlers = {
  addTodo: function(){
    var todoInput = document.getElementById('add-todo-input');
    var todoInputDate = document.getElementById('add-todo-input-date');
    //add todo to the end of the main todo list
    todoList.addTodo(todoInput.value,todoInputDate.value, todoList.todos, todoList.todos.length);
    
    //clear todoInput
    todoInput.value = "";
    todoInputDate.value = "";
   
    

    view.render();
  },
  clearCompleted: function(){
    todoList.clearCompleted(todoList.todos);
    view.render();
  },
  clearAll: function(){
    todoList.clearAll();
    view.render();
  },
  toggleAll: function(){
    todoList.toggleAll();
    view.render();
  },
}

var view = {
  render: function(){
    var ul = document.getElementById("todo-list");
    ul.innerHTML = ""
    //inserts text for when there are no todo list
    if(todoList.todos.length === 0){
      var noTodosP = document.createElement('p');
      noTodosP.textContent = "Look like todo list is empty!";
      ul.appendChild(noTodosP);
    }
      this.renderList(todoList.todos, ul);
    //save todo list
    util.store('todoListData', todoList.todos)
    document.getElementById("add-todo-input").focus();
    document.getElementById("add-todo-input").focus();
    
  },
  renderList: function(array, ulToAppendTo){
    for(var i=0; i<array.length; i++){
      this.createTodoLi(array[i],i,array,ulToAppendTo)
      if(array[i].children.length >0){
        var nestedUl = document.createElement('ul');
        ulToAppendTo.appendChild(nestedUl);
        this.renderList(array[i].children, nestedUl);
      }
    }
  },
  createTodoLi: function(todo,indexOfTodo, array, ulToAppendTo){
    var div = document.createElement('div')
    div.className = 'li-div'
    var todoLi = document.createElement("li")
    var id = todo.id;
    todoLi.id =id;
    var todoTextP = this.createTodoP(todo.todoName, id);
    if(todo.completed === true){
      todoLi.className += 'completed';
    }

    var deleteButton = this.createDeleteButton(indexOfTodo, array);
    var toggleButton = this.createToggleCompletedButton(todo);
    var editInput = this.createEditInput(todo, indexOfTodo, array, id);
    var addSubTodoButton = this.createAddSubTodoButton(todo.children);

   
    ulToAppendTo.appendChild(div);
    div.appendChild(todoLi);
    todoLi.appendChild(todoTextP);
    todoLi.appendChild(editInput);
    todoLi.appendChild(deleteButton);
    todoLi.appendChild(toggleButton);
    todoLi.appendChild(addSubTodoButton);


  },
  createTodoP: function(text, id){
    var p = document.createElement('p');
    p.textContent = text || 'New Todo';
    p.id = id + 'p'
  
    p.addEventListener('click', function(){
      var p = document.getElementById(id + 'p');
      var editInput = document.getElementById(id + "editInput");
      
      editInput.style.display= 'block';
      p.style.display = 'none';
      editInput.focus();
    })

    return p;
  },
  createEditInput: function(todo, indexOfTodo, array, id){
    var editInput = document.createElement('input');
    editInput.value = todo.todoName ;
    editInput.id= id+"editInput";
    editInput.style.display = 'none';

    // formatting Date
    let yourDate = new Date()
    let date = yourDate.toISOString().split('T')[0]

    // formattin Time
    let time = new Date().toLocaleTimeString()


    editInput.addEventListener('keyup', function(e){
        todoList.editTodo(todo, editInput.value + " " + date + " " + time);
    })

    editInput.addEventListener('keydown',function(e){

      if(e.key === "Enter" && event.shiftKey === false){
          var newTodoId = todoList.addTodo("New Todo",'', array, indexOfTodo + 1);
          view.render();
          document.getElementById(newTodoId + 'p').click();
      }

      
      if(e.key === "Enter" && event.shiftKey === true){
        var subTodoId = todoList.addTodo('New SubTodo','', todo.children, todo.children.length);
        view.render();
        var subTodoP = document.getElementById(subTodoId + 'p');
        subTodoP.click();
      }

      if(e.key === "PageDown"){
    
        if(array[indexOfTodo - 1] === undefined) return;

        arrayToInsertIn = array[indexOfTodo - 1].children;
        //inserts todo into previous todo subtodo list
        arrayToInsertIn.splice(arrayToInsertIn.length, 0, todo);
        //deletes old todo
        todoList.deleteTodo(indexOfTodo, array);

      
        view.render();
        var newSubTodo = document.getElementById(id + 'p');
        newSubTodo.click();
      }

      if(e.key === "PageUp"){
       
        var findObject = util.findInTodo(todoList.todos, todo);

        //inserts todo into previous todo subtodo list
        findObject.parentArray.splice(findObject.parentIndex + 1, 0, todo);
        //deletes old todo
        todoList.deleteTodo(indexOfTodo, array);

     
        view.render();
        var outdentedTodo = document.getElementById(id + 'p');
        outdentedTodo.click();
      }
    });
   
    editInput.addEventListener('onClick',function(e){
        view.render();
    });
    return editInput;
  },
  createDeleteButton: function(indexOfTodo, array){
    var deleteButton = document.createElement('button');
    deleteButton.style.backgroundColor="red"
    deleteButton.style.border="1px solid white"
    deleteButton.style.borderRadius="10px"
    deleteButton.style.color="white"
    deleteButton.textContent = " Delete Todo";
    deleteButton.className = 'delete-button'

    deleteButton.onclick = function(){
        todoList.deleteTodo(indexOfTodo, array);
        view.render();
      };
    return deleteButton;
  },
  createToggleCompletedButton: function(todo){
    var toggleButton = document.createElement('button');
    toggleButton.style.backgroundColor="skyblue"
    toggleButton.style.border="1px solid white"
    toggleButton.style.borderRadius="10px"
    toggleButton.style.color="white"
    toggleButton.textContent = "Complete Todo";
    toggleButton.className = 'toggle-button';

    toggleButton.onclick = function(){
        todoList.toggleTodo(todo);
        view.render();
      };
    return toggleButton;
  },
  createAddSubTodoButton: function(array){
    var addSubTodoButton = document.createElement('button');
    addSubTodoButton.style.backgroundColor="green"
    addSubTodoButton.style.border="1px solid white"
    addSubTodoButton.style.borderRadius="10px"
    addSubTodoButton.style.color="white"
    addSubTodoButton.textContent = 'Add Sub Task';
    addSubTodoButton.className = 'add-sub-todo';

    addSubTodoButton.onclick = function(){
      var subtodoId = todoList.addTodo('New SubTodo','',array, array.length);
      view.render();
      var subTodoP = document.getElementById(subtodoId + "p")
      subTodoP.click();
    }

    return addSubTodoButton;
  },
  createCollapseButton: function(toggledFlag,todo){
    var collapseButton = document.createElement('button');
    collapseButton.className = 'collapse-button';
  
    if(toggledFlag === false){
      collapseButton.textContent = '( - )'
    }else{
      collapseButton.textContent = '( + )'
    }
    collapseButton.onlick = function(event,todo){
      todo.collapsed = !todo.collapsed;
    }
    return collapseButton;
  },
}
var util = {
  store: function(nameSpace, data){
    if(arguments.length <2){
      var store = localStorage.getItem(nameSpace);
            return (store && JSON.parse(store)) || [];
    }else{
      return localStorage.setItem(nameSpace, JSON.stringify(data));
    }
  },
  uuid: function () {
      
            var i, random;
            var uuid = '';

            for (i = 0; i < 32; i++) {
                random = Math.random() * 16 | 0;
                if (i === 8 || i === 12 || i === 16 || i === 20) {
                    uuid += '-';
                }
                uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
            }

            return uuid;
        },
  
  findInTodo: function(array, item){
    for(var i=0; i< array.length; i++){
      if(array[i].children.length > 0){
        var result = this.findInTodo(array[i].children, item)
      
        if(result.length === 1){
          result.parentIndex = i;
          result.parentArray = array;
          result.length++;
        }
        if(result.length === 2) return result;
      }

      if(array[i] === item) return {length:1};
    }
  }
}
document.getElementById("add-todo-input").addEventListener('keypress', function(e){
  if(e.key === "Enter"){
    handlers.addTodo();
  }
})
  document.onkeydown = function(e){
  addTodoInput = document.getElementById('add-todo-input')
  currentFocusedElement = document.activeElement;
 
  if(e.code === "ArrowDown" || e.code === "ArrowUp"){
   
    if(currentFocusedElement == addTodoInput ){
      firstTodoId = todoList.todos[0].id;
      var firstTodoP = document.getElementById(firstTodoId + 'p');
      return firstTodoP.click();
    }
    
    if(currentFocusedElement != document.querySelector('body')){
     
      var currentTodoId = currentFocusedElement.id.slice(0,-9)
      var todoLiArray = document.getElementsByTagName("li");
      for(var i=0; i < todoLiArray.length; i++){
        if(todoLiArray[i].id === currentTodoId){
          var arrayPosOfCurrentLi = i;
        }
      }

      if(e.code === "ArrowDown"){
        var arrayPosOfNextLi = arrayPosOfCurrentLi + 1;
      }else{
      
        var arrayPosOfNextLi = arrayPosOfCurrentLi - 1;
      }
      
      if(todoLiArray[arrayPosOfNextLi] === undefined){
        if(e.code === "ArrowDown"){
          var idOfNextTodo = todoLiArray[0].id
        }else{
          var idOfNextTodo = todoLiArray[todoLiArray.length - 1].id
        }
      }else{
        
        var idOfNextTodo = todoLiArray[arrayPosOfNextLi].id;
      }
     
      pElementOfNextTodo = document.getElementById(idOfNextTodo + 'p');
      view.render();
      return  pElementOfNextTodo.click();
    }
   
  }

}

todoList.todos = util.store('todoListData')
view.render(document.getElementById('add-todo-input'));

