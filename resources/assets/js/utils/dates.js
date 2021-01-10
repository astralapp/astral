// https://github.com/n-johnson/relative-date

const SECOND = 1000,
  MINUTE = 60 * SECOND,
  HOUR = 60 * MINUTE,
  DAY = 24 * HOUR,
  WEEK = 7 * DAY,
  YEAR = DAY * 365,
  MONTH = YEAR / 12;

const formats = [
  [ 0.7 * MINUTE, 'just now' ],
  [ 1.5 * MINUTE, 'a minute ago' ],
  [ 60 * MINUTE, 'minutes ago', MINUTE ],
  [ 1.5 * HOUR, 'an hour ago' ],
  [ DAY, 'hours ago', HOUR ],
  [ 2 * DAY, 'yesterday' ],
  [ 7 * DAY, 'days ago', DAY ],
  [ 1.5 * WEEK, 'a week ago'],
  [ MONTH, 'weeks ago', WEEK ],
  [ 1.5 * MONTH, 'a month ago' ],
  [ YEAR, 'months ago', MONTH ],
  [ 1.5 * YEAR, 'a year ago' ],
  [ Number.MAX_VALUE, 'years ago', YEAR ]
];

export const relativeDate = input => {
  const reference = (new Date).getTime();
  let inputDate = new Date(input);
  inputDate instanceof Date && ( inputDate = inputDate.getTime() );
  
  let delta = reference - inputDate,
      format, i, len;

  for(i = -1, len=formats.length; ++i < len; ){
    format = formats[i];
    if(delta < format[0]){
      return format[2] == undefined ? format[1] : Math.round(delta/format[2]) + ' ' + format[1];
    }
  };
};
