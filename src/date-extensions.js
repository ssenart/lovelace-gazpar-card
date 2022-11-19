// See : https://www.digital-web.com/articles/javascript_date_object_with_user_methods/
// and : https://gist.github.com/shergin/602556
// and : https://gist.github.com/tborychowski/83a50500a30a41a7a95f
// and : https://gist.github.com/wildhart/e9a662056baac81d387a80083a4df9d9

//----------------------------------
Date.MonthsByLocale = new Map([
  ['fr', ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']]
]);

//----------------------------------
Date.today = function() {

  var res = new Date();
  res.setHours(0, 0, 0, 0);

  return res;
}

//----------------------------------
Date.parseDate = function(str) {

  var parts = str.split("/");
  var res = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));

  return res;
}

//----------------------------------
Date.prototype.formatDate = function() {

  return this.getDate().toString().padStart(2, '0') + "/" + (this.getMonth()+1).toString().padStart(2, '0') + "/" + this.getFullYear().toString().padStart(2, '4');
}

//----------------------------------
Date.parseWeekPeriod = function(monthPeriodStr, locale = "fr") {

  var parts = monthPeriodStr.split(" ");

  var res = Date.parseDate(parts[1]);

  return res;
}

//----------------------------------
Date.prototype.formatWeekPeriod = function() {

  var endOfWeek = this.addDays(6);

  var res = `Du ${this.formatDate()} au ${endOfWeek.formatDate()}`;

  return res;
}

//----------------------------------
Date.parseMonthPeriod = function(monthPeriodStr, locale = "fr") {

  var parts = monthPeriodStr.split(" ");

  var res = new Date(parseInt(parts[1], 10), Date.MonthsByLocale.get(locale).indexOf(parts[0]), 1);

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

//----------------------------------
// Returns the ISO week of the date.
Date.prototype.getWeek = function() {

  var date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  var week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  var res = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                        - 3 + (week1.getDay() + 6) % 7) / 7);

  return res;
}

//----------------------------------
Date.getDateRangeOfWeek = function(week, year) {

  var d1, numOfdaysPastSinceLastMonday, rangeIsFrom, rangeIsTo;
  d1 = new Date(''+year+'');
  numOfdaysPastSinceLastMonday = d1.getDay() - 1;
  d1.setDate(d1.getDate() - numOfdaysPastSinceLastMonday);
  d1.setDate(d1.getDate() + (7 * (week - d1.getWeek())));
  rangeIsFrom = (d1.getMonth() + 1) + "-" + d1.getDate() + "-" + d1.getFullYear();
  d1.setDate(d1.getDate() + 6);
  rangeIsTo = (d1.getMonth() + 1) + "-" + d1.getDate() + "-" + d1.getFullYear() ;

  return { "from": rangeIsFrom, "to": rangeIsTo };
};