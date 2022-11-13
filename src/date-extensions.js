// See : https://www.digital-web.com/articles/javascript_date_object_with_user_methods/
// and : https://gist.github.com/shergin/602556
// and : https://gist.github.com/tborychowski/83a50500a30a41a7a95f
// and : https://gist.github.com/wildhart/e9a662056baac81d387a80083a4df9d9

//----------------------------------
Date.MonthsByLocale = new Map([
  ['fr', ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']]
]);

//----------------------------------
Date.parseDate = function(str) {

  var parts = str.split("/")
  var res = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10))

  return res;
}

//----------------------------------
Date.prototype.formatDate = function() {

  return this.getDate().toString().padStart(2, '0') + "/" + (this.getMonth()+1).toString().padStart(2, '0') + "/" + this.getFullYear().toString().padStart(2, '4');
}

//----------------------------------
Date.parseMonthPeriod = function(monthPeriodStr, locale = "fr") {

  var parts = monthPeriodStr.split(" ")

  var res = new Date(parseInt(parts[1], 10), Date.MonthsByLocale.get(locale).indexOf(parts[0]), 1)

  return res;
}

//----------------------------------
Date.prototype.formatMonthPeriod = function(locale = 'fr')
{
  return Date.MonthsByLocale.get(locale)[this.getMonth()] + " " + this.getFullYear();
}

//----------------------------------
Date.prototype.addDays = function(days) {

  var res = new Date(this);
  res.setDate(res.getDate() + days);

  return res;
}

//----------------------------------
Date.prototype.addMonths = function(months) {

  var res = new Date(this);
  res.setMonth(res.getMonth() + months);

  return res;
}
