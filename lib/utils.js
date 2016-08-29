'use strict';
var Q           = require('q'),
    fs          = require('fs');

var PACKAGE_FILE_NAME = "package.json";

var utils = {
    loadPackage: function() {
        var deferred = Q.defer();

        fs.exists(PACKAGE_FILE_NAME, function(exists) {
            if (!exists) {
                return deferred.reject(new Error('could not find package file'));
            }

            fs.readFile(PACKAGE_FILE_NAME, function(err, data) {
                if (err) return deferred.reject(err);

                var pkg = JSON.parse(data);
                deferred.resolve(pkg);
            });
        });

        return deferred.promise;
    },

    savePackage: function(pkg) {
        var deferred = Q.defer();

        fs.writeFile(PACKAGE_FILE_NAME, JSON.stringify(pkg, null, 2), function(err) {
            if (err) {
                return deferred.reject(err);
            }
            deferred.resolve();
        });

        return deferred.promise;
    },

    gitUrlParse: function(url) {
        var deferred = Q.defer();

        if (typeof url !== "string") {
            deferred.reject(new Error("The url must be a string."));
            return deferred.promise;
        }

        var urlInfo = {
                protocol: null,
                source: null,
                owner: null,
                name: null,
                sha: null,
                _: url,
                toString: function () {
                    var type = this.protocol;
                    switch (type) {
                        case "ssh":
                            return "git@" + this.source + ":" + this.owner + "/" + this.name + ".git";
                        case "http":
                        case "https":
                            return type + "://" + this.source + "/" + this.owner + "/" + this.name + ".git";
                        default:
                            return this._;
                    }
                }
            },
            match = null;

        // SSH protocol
        check_git: {
            if (/^git\@/.test(url)) {
                match = url.match(/^git@(.*):(.*)\/(.*).git:(.*)$/);
                if (!match) {
                    break check_git;
                }
                urlInfo.source = match[1];
                urlInfo.owner = match[2];
                urlInfo.name = match[3];
                urlInfo.sha = match[4];
                urlInfo.protocol = "ssh";
            } else

            // HTTP(S) protocol
                check_https:{
                    if (/^https?:\/\//.test(url)) {
                        url = url.replace(/\.git$/, "");
                        match = url.match(/^(https?):\/\/(.*)\/(.*)\/(.*):(.*)$/);
                        if (!match) {
                            break check_https;
                        }
                        urlInfo.protocol = match[1];
                        urlInfo.source = match[2];
                        urlInfo.owner = match[3];
                        urlInfo.name = match[4];
                        urlInfo.sha = match[5];
                    } else {
                        urlInfo.protocol = "file";
                    }
                }
        }
        deferred.resolve(urlInfo);

        return deferred.promise;

    },

    timeAgo: function(value) {
        var settings = {
            refreshMillis: 60000,
            allowFuture: false,
            strings: {
                'en_US': {
                    prefixAgo: null,
                    prefixFromNow: null,
                    suffixAgo: 'ago',
                    suffixFromNow: 'from now',
                    seconds: 'less than a minute',
                    minute: 'about a minute',
                    minutes: '%d minutes',
                    hour: 'about an hour',
                    hours: 'about %d hours',
                    day: 'a day',
                    days: '%d days',
                    month: 'about a month',
                    months: '%d months',
                    year: 'about a year',
                    years: '%d years',
                    numbers: []
                },
                'de_DE': {
                    prefixAgo: 'vor',
                    prefixFromNow: null,
                    suffixAgo: null,
                    suffixFromNow: 'from now',
                    seconds: 'weniger als einer Minute',
                    minute: 'ca. einer Minute',
                    minutes: '%d Minuten',
                    hour: 'ca. einer Stunde',
                    hours: 'ca. %d Stunden',
                    day: 'einem Tag',
                    days: '%d Tagen',
                    month: 'ca. einem Monat',
                    months: '%d Monaten',
                    year: 'ca. einem Jahr',
                    years: '%d Jahren',
                    numbers: []
                },
                'he_IL': {
                    prefixAgo: null,
                    prefixFromNow: null,
                    suffixAgo: 'לפני',
                    suffixFromNow: 'מעכשיו',
                    seconds: 'פחות מדקה',
                    minute: 'כדקה',
                    minutes: '%d דקות',
                    hour: 'כשעה',
                    hours: 'כ %d שעות',
                    day: 'יום',
                    days: '%d ימים',
                    month: 'כחודש',
                    months: '%d חודשים',
                    year: 'כשנה',
                    years: '%d שנים',
                    numbers: []
                },
                'pt_BR': {
                    prefixAgo: null,
                    prefixFromNow: 'daqui a',
                    suffixAgo: 'atrás',
                    suffixFromNow: null,
                    seconds: 'menos de um minuto',
                    minute: 'cerca de um minuto',
                    minutes: '%d minutos',
                    hour: 'cerca de uma hora',
                    hours: 'cerca de %d horas',
                    day: 'um dia',
                    days: '%d dias',
                    month: 'cerca de um mês',
                    months: '%d meses',
                    year: 'cerca de um ano',
                    years: '%d anos',
                    numbers: []
                },
                'fr_FR': {
                    prefixAgo: 'il y a',
                    prefixFromNow: null,
                    suffixAgo: null,
                    suffixFromNow: 'from now',
                    seconds: 'moins d\'une minute',
                    minute: 'environ une minute',
                    minutes: '%d minutes',
                    hour: 'environ une heure',
                    hours: 'environ %d heures',
                    day: 'un jour',
                    days: '%d jours',
                    month: 'environ un mois',
                    months: '%d mois',
                    year: 'environ un an',
                    years: '%d ans',
                    numbers: []
                }
            }
        };

        var inWords = function (distanceMillis) {
            var lang = 'en_US'; // TODO - param ?
            var $l = settings.strings[lang];
            if (typeof $l === 'undefined') {
                $l = settings.strings['en_US'];
            }
            var prefix = $l.prefixAgo;
            var suffix = $l.suffixAgo;
            if (settings.allowFuture) {
                if (distanceMillis < 0) {
                    prefix = $l.prefixFromNow;
                    suffix = $l.suffixFromNow;
                }
            }

            var seconds = Math.abs(distanceMillis) / 1000;
            var minutes = seconds / 60;
            var hours = minutes / 60;
            var days = hours / 24;
            var years = days / 365;

            function substitute(stringOrFunction, number) {
                var string = (typeof stringOrFunction === 'function') ?
                    stringOrFunction(number, distanceMillis) : stringOrFunction;
                var value = ($l.numbers && $l.numbers[number]) || number;
                return string.replace(/%d/i, value);
            }

            var words = seconds < 45 && substitute($l.seconds, Math.round(seconds)) ||
                seconds < 90 && substitute($l.minute, 1) ||
                minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
                minutes < 90 && substitute($l.hour, 1) ||
                hours < 24 && substitute($l.hours, Math.round(hours)) ||
                hours < 42 && substitute($l.day, 1) ||
                days < 30 && substitute($l.days, Math.round(days)) ||
                days < 45 && substitute($l.month, 1) ||
                days < 365 && substitute($l.months, Math.round(days / 30)) ||
                years < 1.5 && substitute($l.year, 1) ||
                substitute($l.years, Math.round(years));

            var separator = $l.wordSeparator === undefined ?  ' ' : $l.wordSeparator;
            if(lang === 'he_IL'){
                return [prefix, suffix, words].join(separator).trim();
            } else {
                return [prefix, words, suffix].join(separator).trim();
            }
        };

        var parse = function (iso8601) {
            var s = (iso8601 || '').trim();
            s = s.replace(/\.\d+/, ''); // remove milliseconds
            s = s.replace(/-/, '/').replace(/-/, '/');
            s = s.replace(/T/, ' ').replace(/Z/, ' UTC');
            s = s.replace(/([\+\-]\d\d)\:?(\d\d)/, ' $1$2'); // -04:00 -> -0400
            return new Date(s);
        };

        var fromTime = parse(value);
        var diff = Date.now() - fromTime;
        return inWords(diff);
    }
};

module.exports = utils;