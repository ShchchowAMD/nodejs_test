'use strict'
const math = require('mathjs')

function cvt_constraint_to_arr(result){
  if(!Array.isArray(result))
    result = [result];
  for(let item in result){
    if(isNaN(result[item])){
        result[item] = 0;
    }
  }
  return result;
}

function column_mul_div(p1, op, p2){
    let result = []
    let opfunc = '';
    if(op === '*')
        opfunc = math.multiply;
    else if(op === '/')
        opfunc = math.divide;

    if(p1.length === 1)
      for(let pitem2 in p2)
        result.push(opfunc(p1[0], p2[pitem2]))
    else
      for(let pitem1 in p1)
        for(let pitem2 in p2)
        result.push(opfunc(p1[pitem1], p2[pitem2]))
    return result;

}
function normalCal(para1, op, para2){
  let arr_flag = [0, 0]
  let p1 = para1;
  if(Array.isArray(para1) && para1.length === 1)
    p1 = para1[0]
  let p2 = para2;
  if(Array.isArray(para2) && para2.length === 1)
    p2 = para2[0]
  let result = 0;
  switch(op){
    case '+':
      result = math.add(p1, p2);
      return cvt_constraint_to_arr(result);
    case '-':
      result = math.subtract(p1, p2);
      return cvt_constraint_to_arr(result);
    case '*':
      return column_mul_div(cvt_constraint_to_arr(p1), '*', cvt_constraint_to_arr(p2));
    case '/':
      return column_mul_div(cvt_constraint_to_arr(p1), '/', cvt_constraint_to_arr(p2));
  }
}

function statistical(para, op){
  const statistics_case = ['avg','std','max','min','sum','var','median'];
  let p1 = para;
  if(!Array.isArray(p1)){
    p1 = [p1]
  }
  result = ''
  switch('op'){
    case 'avg':
        result = column_mul_div(cvt_constraint_to_arr(math.sum(p1)), '/', cvt_constraint_to_arr(p1.length));
        break;
    case 'std':
        result = math.std(p1);
        break;
    case 'max':
        result = math.max(p1);
        break;
    case 'min':
        result = math.min(p1);
        break;
    case 'sum': 
        result = math.sum(p1);
        break;
    case 'var':
        result = math.var(p1);
        break;
    case 'median':
        result = math.median(p1)
        break;
  }

  if(!Array.isArray(result)){
    result = [result]
  }
  return result;
}

function calculator(formula, dataload){
  let stack = [];
  
  const statistics_symbol = {'avg(' : ')', 'std(' : ')', 'max(' : ')', 'min(' : ')', 'sum(' : ')', 'var(' : ')', 'median(' : ')'};
  const basic_symbol = ['+', '-', '*', '/'];
  const pathe_symbol = {'(':')', '[':']', '{':'}'}
  let injected_data = dataload;

  let rest_formula = formula.replace(' ', '');
  let start_pos = 0;
  let end_pos = formula.length;
  let curr_pos = 0;
  let flag = true;
  let final_result = [];

  while(flag && rest_formula.length > 0){
    // statistics
    for(let sta_symbo in statistics_symbol)
      if(rest_formula.startsWith(sta_symbo)){
        stack.push(rest_formula.substring(0, sta_symbo.length-1));
        stack.push(statistics_symbol[sta_symbo]);
        rest_formula = rest_formula.substring(sta_symbo.length, rest_formula.length);
        flag = false;
        break;
      }

    // + - * /
    for(let i = 0 ; i < 4; i ++)
      if(rest_formula.startsWith(basic_symbol[i])){
        stack.push(rest_formula.substring(0, 1));
        rest_formula = rest_formula.substring(1, rest_formula.length);
        flag = false;
        break;
      }
    
    // ) ] }
    for(let j in pathe_symbol)
      if(rest_formula.startsWith(pathe_symbol[j])){
        let breakout = false;
        let middle_data = 1;
        while(!breakout){
            let curr_in_stack = stack.pop();
            if(pathe_symbol[curr_in_stack] === j){
                stack.push(middle_data);
                breakout = true;
            }
            else if(curr_in_stack in statistics_symbol)
                middle_data = statistical(middle_data, curr_in_stack)
            else if(curr_in_stack in basic_symbol)
                middle_data = normalCal(stack.pop(), middle_data, curr_in_stack)
        }
        // get result
        rest_formula = rest_formula.substring(1, rest_formula.length);
        flag = false;
        break;
      }

    // injected data;
    for(let k in dataload)
      if(rest_formula.startsWith(k)){
        stack.push(dataload[k]);
        // get result
        rest_formula = rest_formula.substring(k.length, rest_formula.length);
        flag = false;
        break;
      }
  }
  let middle_data = stack.pop();
  // last step
  if(stack.length >= 1){
    let breakout = false;
    while(!breakout){
        let curr_in_stack = stack.pop();
        if(curr_in_stack in statistics_symbol)
            middle_data = statistical(middle_data, curr_in_stack);
        else if(curr_in_stack in basic_symbol)
            middle_data = normalCal(stack.pop(), curr_in_stack, middle_data);
        else if(stack.length === 0)
            break;
    }
  }
  final_result = middle_data;
  return final_result;
}

const test_data = { 'A' : [1,2,3] , 'B' : 3};
const test_formula = 'A+B';
console.log(calculator(test_formula, test_data));

/***

// add
console.log(normalCal([1,2], '+', 3))
console.log(normalCal([1], '+', 3))
console.log(normalCal([1,2], '+', [3,4]))
console.log(normalCal([1,2], '+', [3]))
console.log(normalCal(1, '+', [3,4]))
console.log(normalCal("Infinity", '+', [3,4]))
console.log(normalCal(["Infinity"], '+', [3,4]))
console.log(normalCal(3, '+', [3,"Infinity"]))
console.log(normalCal("Infinity", '+', [3,"-Infinity"]))


// sub
console.log(normalCal([1,2], '-', 3))
console.log(normalCal([1], '-', 3))
console.log(normalCal([1,2], '-', [3,4]))
console.log(normalCal([1,2], '-', [3]))
console.log(normalCal(1, '-', [3,4]))
console.log(normalCal("Infinity", '-', [3,4]))
console.log(normalCal(["Infinity"], '-', [3,4]))
console.log(normalCal(3, '-', [3,"Infinity"]))



// divide
console.log(normalCal([1,2], '/', 3))
console.log(normalCal([1], '/', 3))
console.log(normalCal([1,2], '/', [3,4]))
console.log(normalCal([1,2], '/', [3]))
console.log(normalCal(1, '/', [3,4]))
console.log(normalCal("Infinity", '/', [3]))
console.log(normalCal("Infinity", '/', [3,4]))
console.log(normalCal(["Infinity"], '/', [3,4]))
console.log(normalCal(3, '/', [3,"Infinity"]))
//calculate(formula, dataload);

***/
