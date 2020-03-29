//create module in js + IIFE Immediately Invoked Function Expression

/***************************************************************************************************
 ******************************BUDGGET CONTROLLER***************************************************
 ***************************************************************************************************/
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id
        this.description = description
        this.value = value
        this.percentage = -1
    }

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100)
        } else {
            this.percentage = -1
        }
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage
    }

    var Income = function (id, description, value) {
        this.id = id
        this.description = description
        this.value = value
    }

    var calculateTotal = function (type) {
        var sum = 0
        data.allItems[type].forEach(function (cur) {
            sum += cur.value
        })
        data.totals[type] = sum
    }

    var data = {
        allItems: {
            inc: [],
            exp: []
        },

        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function (type, desc, val) {
            var newItem, ID

            //[1 2 3 4 5] => new ID =6
            //[1 2 4 5 6] => new ID=7
            //new ID = last ID +1, (Length of array -1)+1

            //new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1
            } else {
                ID = 1
            }

            //create new element based on income and expense type
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val)
            } else if (type === 'inc') {
                newItem = new Income(ID, desc, val)
            }

            //push element in our data structure (inc or exp)
            data.allItems[type].push(newItem)

            //returnin new Item
            return newItem
        },

        deleteitem: function (type, id) {
            var ids, index

            ids = data.allItems[type].map(function (current) {
                return current.id
            })

            index = ids.indexOf(id)

            if (index !== -1) {
                data.allItems[type].splice(index, 1)
            }
        },

        calculateBudget: function () {
            //calculate total inc and exp
            calculateTotal('inc')
            calculateTotal('exp')

            //calculate the budget : inc - exp
            data.budget = data.totals.inc - data.totals.exp

            //calculate percentage of income we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
            } else {
                data.percentage = -1
            }
            //exp = 100 and inc = 200, spent = (100/200) * 100
        },

        calculatePerc: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc)
            })
        },

        getPercentages: function () {//map return somthn and store in array
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage()
            })
            return allPerc
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        }
    }

})()




/***************************************************************************************************
 ******************************USER INTERFACE CONTROLLER********************************************
 ***************************************************************************************************/
var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputValue: '.add__value',
        inputDesc: '.add__description',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        itemPercentage: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var formatNumber = function (num, type) {
        var numSplit, int, desc
        /*
        exactly 3 decimal points
        comma separating thhe thousands

        2000->2,000
        2313.23->2,313.23
        */
        num = Math.abs(num)
        num = num.toFixed(2)
        numSplit = num.split('.')

        int = numSplit[0]
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3)
        }
        dec = numSplit[1]

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec
    }

    var nodeListForEach = function (list, callBack) {
        for (var i = 0; i < list.length; i++) {
            callBack(list[i], i)
        }
    }

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,//would be either income or expense
                desc: document.querySelector(DOMstrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addlistItem: function (obj, type) {

            var html, newHtml, element

            //1. Add html strings with placeholder text
            if (type === 'inc') {

                element = DOMstrings.incomeContainer

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix">' +
                    '<div class="item__value">%value%</div><div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="fa fa-times-circle-o"></i></button></div> </div> </div>'

            } else if (type === 'exp') {

                element = DOMstrings.expenseContainer

                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div><div class="right clearfix">' +
                    '<div class="item__value">%value%</div> <div class="item__percentage">21%</div><div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="fa fa-times-circle-o"></i></button></div></div></div>'

            }

            //2. replace placeholders with actual data
            newHtml = html.replace('%id%', obj.id)
            newHtml = newHtml.replace('%description%', obj.description)
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type))

            //3. Insert html into DOM 
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
        },

        clearFields: function () {

            var fields, fieldsArr

            fields = document.querySelectorAll(DOMstrings.inputValue + ',' + DOMstrings.inputDesc)
            fieldsArr = Array.prototype.slice.call(fields)
            fieldsArr.forEach(function (current, i, array) {
                current.value = ""
            })
            // fieldsArr.focus()
        },

        displayBudget: function (obj) {

            var type

            obj.budget > 0 ? type === 'inc' : type === 'exp'

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type)
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc')
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp')

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%"
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "---"
            }


        },

        deleteListItem: function (selectorId) {
            el = document.getElementById(selectorId)
            el.parentNode.removeChild(el)
        },

        displayPercentage: function (percentage) {
            var fields = document.querySelectorAll(DOMstrings.itemPercentage)

            

            nodeListForEach(fields, function (current, index) {

                if (percentage[index] > 0) {
                    current.textContent = percentage[index] + '%'
                } else {
                    current.textContent = '----'

                }
            })
        },

        displayMonth: function () {
            var now, year

            now = new Date()
            // var christmas = new Date(2020,12,25)

            months=['JAnuary','February','March','April','May',
                    'June','July','August','September','October',
                    'November','December']
            month = now.getMonth()
            year = now.getFullYear()
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year
        },

        changedType:function(){
            var fields=document.querySelectorAll(
                DOMstrings.inputType+','+
                DOMstrings.inputDesc+','+
                DOMstrings.inputValue
            )

            nodeListForEach(fields,function(cur){
                cur.classList.toggle('red-focus')
            })

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red')
        },

        getDOMStrings: function () {
            return DOMstrings
        }
    }

})()




/***************************************************************************************************
 ******************************GGLOBAL VARIABLE CONTROLLER******************************************
 ***************************************************************************************************/
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {

        var DOM = UICtrl.getDOMStrings()
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)

        document.addEventListener('keypress', function (e) {
            if (e.keyCode === 13 && e.which == 13) {
                ctrlAddItem()
            }
        })

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)

        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType)
    }

    var updateBudget = function () {
        //1. calculate the budget
        budgetCtrl.calculateBudget()

        //2. return budget
        var budget = budgetCtrl.getBudget()

        //2. display the budgget on the ui
        UICtrl.displayBudget(budget)
    }

    var updatePercentage = function () {

        //calculate percentages
        budgetCtrl.calculatePerc()

        //read percentagges from budggget controler
        var percent = budgetCtrl.getPercentages()

        //update the ui with new percentagges
        UICtrl.displayPercentage(percent)

    }

    var ctrlAddItem = function () {

        var input, newItem

        //1. get the field input data
        input = UICtrl.getInput()

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            //2. add the item to the budget controller
            newItem = budgetCtrl.addItem(
                input.type,
                input.desc,
                input.value
            )

            //3. add the item to the ui
            UICtrl.addlistItem(newItem, input.type)

            //clear fields
            UICtrl.clearFields()

            //calculate and update budget
            updateBudget()

            //calculate and update percentage
            updatePercentage()

        } else {
            alert("Jama wakujuje neza ibisabwa!!")
        }
    }

    var ctrlDeleteItem = function (event) {

        var itemID, splitID

        console.log(event.target.parentNode.parentNode.parentNode.parentNode.id)
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id

        if (itemID) {
            //break string into array inc-1 => ["inc","1"]
            splitID = itemID.split("-")
            console.log(splitID)
            type = splitID[0]
            ID = parseInt(splitID[1])

            //1. delete the item from data structure
            budgetCtrl.deleteitem(type, ID)

            //2. delete item fro UI
            UICtrl.deleteListItem(itemID)

            //3. Update and show the new budget
            updateBudget()

            //calculate and update percentage
            updatePercentage()
        }
    }

    return {
        init: function () {
            console.log("App started")
            console.log(UICtrl.displayMonth())
            UICtrl.displayBudget(
                {
                    budget: 0,
                    totalInc: 0,
                    totalExp: 0,
                    percentage: -1
                }
            )
            setupEventListeners()
        }
    }


})(budgetController, UIController)

controller.init()