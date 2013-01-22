if (!String.prototype.padLeft) {
  String.prototype.padLeft = function (length, padChar) {   
    "use strict";

    var padStr = "";
    for(var i = 0; i < length-1; i++) {
      padStr = padStr + padChar;  
    }
    return padStr+this;
  };
}

if (!Number.prototype.getNumberOfDigits) {
  Number.prototype.getNumberOfDigits = function ( ) {
    "use strict";

    var digits = 0;
    var that = this;
    while ( that >= 1 ) {
      that = that/10;
      digits = digits+1;
    }
    return digits;
  };
}

var MyDateObj = function ( y, m, d) {
  "use strict";

  var dayMonthHash = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
  var year, month, day;
  var that = this;

  var setYearMonthDate = function ( y, m, d) {
    that.year = y;
    that.month = m;
    that.day = d;

    return that;
  };

  var isLeapYear = function ( ) {
    if ( that.year % 4 === 0 ) {
      if ( that.year % 100 === 0 ) {
        if ( that.year % 400 === 0 ) {
          return true;
        }
        return false;
      }
      return true;
    } 
    return false;
  };

  var cleanYear = function ( ) {
    if ( that.year.getNumberOfDigits() < 4 ) {
      that.year = 2000+that.year;
    }
    return that;
  };

  setYearMonthDate(y, m, d);
  cleanYear();

  return {
    isValidYearMonthDay: function ( ) {
      if ( that.month > 12 || that.month < 1 || that.day < 1 || that.day > 31 ){
        return false;
      }
      if ( that.month === 2 ) {
        if ( isLeapYear() ) {
          return that.day <= 29;
        }
      }
      return  that.day <= dayMonthHash[that.month-1];
    },

    formatDate: function ( ) {
      that.year = that.year.toString();
      that.month = that.month.toString();
      that.day = that.day.toString();
 
      if ( that.day.length < 2 ) { 
        that.day = that.day.padLeft(2, '0');
      }
      if ( that.month.length < 2 ) { 
        that.month = that.month.padLeft(2, '0');
      }

      return that.year + "-" + that.month + "-" + that.day;
    }
  };
};

var MyPrintEarliestValidDateObj = function ( ) {  
  "use strict";

  var getEarliestValidDate = function ( inputDateString ) {
    var inputDateArray = 
      inputDateString.split('/').map(function(x){return parseInt(x, 10); });
    inputDateArray.sort(function(a, b){ return (a-b); });

    if ( inputDateArray[0] > 31 || inputDateArray[1] > 31 ) {
      return false;
    }

    for ( var i=0; i < 3; i++ ) {
      var myDateObj = 
        new MyDateObj(inputDateArray[i], inputDateArray[(i+1) % 3], inputDateArray[(i+2) %3]);
      if ( myDateObj.isValidYearMonthDay() ){
        return myDateObj.formatDate();
      } else {
        myDateObj = 
          new MyDateObj(inputDateArray[i], inputDateArray[(i+2) % 3], inputDateArray[(i+1) %3]);

        if ( myDateObj.isValidYearMonthDay() ){
          return myDateObj.formatDate();
        } 
      }
    }
  };
  
  return {
    printEarliestValidDate: function ( inputDateString ) {
      var validDate = getEarliestValidDate(inputDateString);

      if ( validDate ) {
        return validDate;
      } else {
        return (inputDateString+" is illegal");
      }
    }
  };

}();