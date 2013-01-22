var MyProbabilityObj = function ( ) {

  "use strict";

  var binomialCoeff = function ( r, k ) {
    var bcf = 1;
    var i;

    for ( i = r-k+1; i <= r; i++ ) {
      bcf = bcf * i;
    }
    for ( i = 1; i <= k; i++ ) {
      bcf = bcf / i;
    }
    return bcf;
  };

  var calculateProbabilityForGroup = function ( m, n, t, p ) {
    var prob = 0;

    if ( n * t < p ) {
      return 0;
    }

    var nWinnersFromMEntries = binomialCoeff(m, n);
    for ( var i = Math.ceil(p/t); i <= p; i++ ) {
      prob = 
        prob + (binomialCoeff(p, i) * binomialCoeff((m-p), (n-i)) / nWinnersFromMEntries);
    }

    return prob;
  };

  return {

    getProbability: function ( inputString ) {

      var inputArray = 
        inputString.split(' ').map(function(x){return parseInt(x, 10); });
      var m = inputArray[0];
      var n = inputArray[1];
      var t = inputArray[2];
      var p = inputArray[3];

      if ( !( m && n && t && p) || m > 1000 || n > m || t > 100 || p> m ) {
        return 0;
      }

      return calculateProbabilityForGroup(m, n, t, p);
    } 
  };
}();
