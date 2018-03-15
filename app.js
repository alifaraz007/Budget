//Budget controller
var budgetController = (function(){ 
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalInc){
        if(totalInc > 0){
            this.percentage = Math.round((this.value/totalInc)*100);
        } else{
            this.percentage = -1;
        }
        
    };
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var data = {
        allItem: {
            exp: [],
            inc: [] 
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentagae: -1
    };
    
    var totalSum = function(type){
        sum = 0;
        data.allItem[type].forEach(function(cur){
          sum += cur.value;  
        });
        data.total[type] = sum;
    }
    
    return {
        addItem: function(type, des, val){
            var newItem, ID;
            
            //making a different id
            if(data.allItem[type].length > 0){
                ID = data.allItem[type][data.allItem[type].length - 1].id + 1;
            }else {
                ID = 0;
            }
            // creating new item
            if(type == 'exp'){
                newItem = new Expense(ID, des, val);
            } else if (type == 'inc'){
                newItem = new Income(ID, des, val);
            }
            
            // making an array of all items
            data.allItem[type].push(newItem);
            
            return newItem;
        },
        
        deleteItem: function(type, id){
            var ids, index;
            ids = data.allItem[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItem[type].splice(index, 1);
            }
        },
        
        budgetCalc: function(){
            //1.calculate total income and expenses
            totalSum('exp');
            totalSum('inc');
            //2.calculate budget: income - expenses
            data.budget = data.total.inc - data.total.exp;
            //3.calculate percentage: (expenses/income)*100
            if(data.total.inc>0){
                data.percentagae = Math.round((data.total.exp / data.total.inc)*100);
            }else{
                data.percentagae = -1;
            }
            
        },
        
        getBudget: function(){
            return {
            totalInc: data.total.inc,
            totalExp: data.total.exp,    
            budget: data.budget,
            per: data.percentagae
            }
        },
        
        percentCalc: function(){
            data.allItem.exp.forEach(function(cur){
                cur.calcPercentage(data.total.inc);
            });
        },
        
        getPercent: function(){
            var getper = data.allItem.exp.map(function(cur){
                return cur.getPercentage();
            });
            return getper;
        }
        
    }

})();



//----------------------------------------------------------------------------------------------------------------------



//UI controller
var uiController = (function(){
    
    var inputDAta = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatChanger = function(num, type){
            var int, numSplit, dec;
            num = Math.abs(num);
            num = (num).toFixed(2);
            numSplit = (num).split('.');
            int = numSplit[0];
            if(int.length>3){
                int = int.substr(0, int.length-3)+ ',' +int.substr(int.length-3, 3);
            }
            
            dec = numSplit[1];
            return ((type === 'exp')? '-':'+') + int + '.' + dec;
        };
    
    var nodeListForEach = function(list, callBack){
                for(var i = 0; i< list.length; i++){
                    callBack(list[i], i);
                }
            };
    
    return{
        getInput: function(){
            return{
                type:  document.querySelector(inputDAta.inputType).value,
                description: document.querySelector(inputDAta.inputDescription).value,
                value: parseFloat(document.querySelector(inputDAta.inputValue).value)
            };
            
        },
        
        DOMselctor: function(){
            return inputDAta;
        },
        
        clearFields: function(){
            var field, fieldArr;
            field = document.querySelectorAll(inputDAta.inputDescription+ ', ' +inputDAta.inputValue);
            fieldArr = Array.prototype.slice.call(field);
            fieldArr.forEach(function(current, index, array){
                current.value = "";
            });
            fieldArr[0].focus();
        },
        
        addListItem: function(obj, type){
            var html, newHtml, element;
            //creating html for ui
            if(type === 'inc'){
                element = document.querySelector(inputDAta.incomeContainer);
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === 'exp'){
                element = document.querySelector(inputDAta.expensesContainer);
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            //replacing html value 
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatChanger(obj.value, type));
            
            //update ui 
            element.insertAdjacentHTML('beforeend', newHtml);
        },
        
        delListItem: function(selectorId){
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },
        
        displayBudget: function(budget){
            var type;
            (budget.budget>0)? type= 'inc': type= 'exp';
            document.querySelector(inputDAta.budgetLabel).textContent = formatChanger(budget.budget, type);
            document.querySelector(inputDAta.incomeLabel).textContent = formatChanger(budget.totalInc, 'inc');
            document.querySelector(inputDAta.expensesLabel).textContent = formatChanger(budget.totalExp, 'exp');
            if(budget.per>0){
                document.querySelector(inputDAta.percentageLabel).textContent = budget.per + "%";
            }else{
                document.querySelector(inputDAta.percentageLabel).textContent = "---";
            }
            
        },
        
        displayPercent: function(percentage){
            var fields = document.querySelectorAll(inputDAta.expPercLabel);
            
            
            
            nodeListForEach(fields, function(current, index){
                if(percentage[index] > 0){
                   current.textContent = percentage[index] + "%"; 
                }else{
                    current.textContent = "---"; 
                }
                
            });
        },
        
        displayDate: function(){
            var now, months, month, year, day;
            now = new Date();
            months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(inputDAta.dateLabel).textContent = months[month]+ ' ' +year;
        },
        
        colorChanger: function(){
            var fields = document.querySelectorAll(
                inputDAta.inputType+ ', ' +
                inputDAta.inputDescription+ ', ' +
                inputDAta.inputValue
            );
            
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(inputDAta.inputBtn).classList.toggle('red');
            
            
        }
    }
    
})();


//---------------------------------------------------------------------------------------------------------------------------



//Global app controller
var controller = (function(bgtCtrl, uiCtrl){ 
    
    var DOM = uiCtrl.DOMselctor();
    
    var eventController = function(){
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', uiCtrl.colorChanger);
    };
    
    var updateBudget = function(){
        //1.calculate data
        bgtCtrl.budgetCalc();
        //2.return data
        var bud = bgtCtrl.getBudget();
        //3.display the item on the UI
        uiCtrl.displayBudget(bud);
    };
    
    var updatePercentage = function(){
        //1.calculate expense percentage
        bgtCtrl.percentCalc();
        //2.return percentage
        var per = bgtCtrl.getPercent();
        //3.update in ui
        uiCtrl.displayPercent(per);
        
    }
    
    var ctrlAddItem = function(){
        var input, inputItem;
        //1.get input data
        input = uiCtrl.getInput();
        
        if(input.description !== "" && input.value>0 && !isNaN(input.value)){
             //2.update data in budget controller
            inputItem = bgtCtrl.addItem(input.type, input.description, input.value);
            //3.add the item to UI
            uiCtrl.addListItem(inputItem, input.type);
            //4.clear fields
            uiCtrl.clearFields();
            //5.budget update
            updateBudget();
            //6.percentage update
            updatePercentage();
        }    
    };
    
    var ctrlDeleteItem = function(event){
        var itemId, idSplit, type, iD;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemId){
            idSplit = itemId.split('-');
            type = idSplit[0];
            iD = parseInt(idSplit[1]);
            
            //1.delete item from data structure
            bgtCtrl.deleteItem(type, iD);
            //2.delete item from ui
            uiCtrl.delListItem(itemId);
            //3.update and show result on ui
            updateBudget();
            //6.percentage update
            updatePercentage();
        }
    };
    
   return {
       inIt: function(){
           uiCtrl.displayDate();
           uiCtrl.displayBudget({
                totalInc: 0,
                totalExp: 0,    
                budget: 0,
                per: -1
            });
           eventController();
       }
   }
    
   var inIt = eventController();
    
})(budgetController, uiController);


controller.inIt();





















