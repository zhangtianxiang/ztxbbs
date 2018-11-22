const fs = require('fs')
const path = require('path')
const models = require('../models')
const moment = require('moment')
const userconfig = require('../config/userconfig')

function update_forum_last_reply(forum,forumdelta) {
  if (forum.last_reply_time > forumdelta.last_reply_time) return null;
  return forum.update(forumdelta).then(forum => {
    return forum.getForum().then(father => {
      if (!father) return null;
      return update_forum_last_reply(father,forumdelta);
    });
  });
}

function get_abstract(raw_input,len) {
  var lenn = 32;
  if (len && len>0) lenn = len;
  var reg = /[\\\`\*\_\[\]\#\+\-\!\>]/g;
  var reg2 = /\s{2,}/g; //空白字符
  return raw_input.replace(reg,"").replace(reg2," ").substr(0,lenn)
}

module.exports = {
  inf: function (...strs) {
    strs[0] =   '\x1B[46mztxbbs INF > \x1B[0m'+strs[0]
    console.log(...strs)
  },
  err: function (...strs) {
    strs[0] = '\x1B[95;7mztxbbs ERR > \x1B[0m'+strs[0]
    console.log(...strs)
  },
  war: function (...strs) {
    strs[0] = '\x1B[93;7mztxbbs WAR > \x1B[0m'+strs[0]
    console.log(...strs)
  },
  suc: function (...strs) {
    strs[0] =   '\x1B[42mztxbbs SUC > \x1B[0m'+strs[0]
    console.log(...strs)
  },
  sql: function (...strs) {
    // strs[0] =   '\x1B[46mztxbbs DB  > \x1B[0m'+strs[0]
    // console.log(strs[0])
  },
  check_email: function (email) {
    if (!email) return false;
    var reMail = /^(?:[a-zA-Z0-9]+[_\-\+\.]?)*[a-zA-Z0-9]+@(?:([a-zA-Z0-9]+[_\-]?)*[a-zA-Z0-9]+\.)+([a-zA-Z]{2,})+$/;
    var tester = new RegExp(reMail);
    return tester.test(email)
  },
  get_confirm_code: function (len) {
    var lenn = 10;
    if (len && len>0) lenn = len;
    var x = "0123456789qwertyuioplkjhgfdsazxcvbnm";
    var tmp = "";
    var timestamp = new Date().getTime();
    for (var i = 0; i < lenn; i ++ ) {
      tmp += x.charAt(Math.ceil(Math.random()*100000000)%x.length);
    }
    return timestamp+tmp;
  },
  get_confirm_date: function () { // 以毫秒计数
    // var intervall = 30 * 60 * 1000;// 30分钟
    // var confirm_date = new Date().setTime((new Date().getTime())+intervall)
    // return confirm_date;// date
    return new Date();
  },
  get_forum_deep_4: function get_forum_deep_4(father_forum,deep) {
    if (deep > 4) {
      throw new Error('递归查询子版块出错！');
    }
    if (deep == 4) { return; }
    return father_forum.getForums().then(forums => {
      father_forum.son = forums;
      return Promise.all(father_forum.son.map(forum => get_forum_deep_4(forum,deep+1)))
    })
  },
  update_forum_last_reply: update_forum_last_reply,
  update_topic_last_reply: function update_topic_last_reply(topic,topicdelta) {
    if (topic.last_reply_time > topicdelta.last_reply_time) return null;
    return topic.update(topicdelta).then(topic => {
      return topic.getForum().then(forum => {
        if (!forum) return null;
        let forumdelta = {
          last_reply_time: topic.last_reply_time,
          last_reply_nickname: topic.last_reply_nickname,
          last_reply_uid: topic.last_reply_uid,
          last_reply_topic: topic.title,
          last_reply_tid: topic.id
        };
        return update_forum_last_reply(forum,forumdelta);
      });
    });
  },
  user_banned: function (user) {
    if (!user) return true;
    if ((user.authority_user&1)>0) return true;
    return false;
  },
  user_confirmed: function (user) {
    if (!user) return false;
    if ((user.authority_user&(1<<1))==0) return true;
    return false;
  },
  user_can_create_topic: function (user,forum) {
    if (!user) return false;
    if (!forum) return false;
    if (forum.authority_topic == 2) return false;
    if (forum.authority_topic == 1) {
      return user.authority_admin > 0 ? true : false;
    }
    return user.authority_user == 0 ? true : false;
  },
  user_can_manage_topic: function (user,topic) {
    if (!user) return false;
    if ((user.authority_admin & (1|(1<<6)))>0) return true;
    if (topic && topic.user_id === user.id) return true;
    return false;
  },
  user_can_edit_topic: function (user,topic) {
    if (!user) return false;
    if ((user.authority_admin & (1|(1<<6)))>0) return true;
    if (topic && topic.user_id === user.id) return true;
    return false;
  },
  user_manage_topic: function (user) {
    if (!user) return false;
    if ((user.authority_admin & (1|(1<<6)))>0) return true;
    return false;
  },
  user_can_create_comment: function (user) {
    if (!user) return false;
    if ((user.authority_user & (1|(1<<1)))>0) return false;// ban or not confirmed
    return true;
  },
  user_can_remove_comment: function (user,comment) {
    if (!user) return false;
    if (!comment) return false;
    if ((user.authority_admin & (1|(1<<6)))>0) return true;// admin
    if ((user.authority_user & (1|(1<<1)))>0) return false;// ban or not confirmed
    if (comment.user_id == user.id) return true;
    return false;
  },
  user_can_edit_comment: function (user,comment) {
    if (!user) return false;
    if (!comment) return false;
    if ((user.authority_user & (1|(1<<1)))>0) return false;// ban or not confirmed
    if (comment.user_id == user.id) return true;
    return false;
  },
  user_can_create_forum: function (user) {
    if (!user) return false;
    return (user.authority_admin & (1|(1<<3))) > 0 ? true : false;
  },
  get_pre_forums: function get_pre_forums(forumnow,forum_list) {
    return forumnow.getForum().then(forum => {
      if (!forum) { return; }
      forum_list.push(forum)
      return get_pre_forums(forum,forum_list)
    })
  },
  user_may_edit_user: function(A,Bid) {
    if (!A) return false;
    if (!Bid) return false;
    if ((A.authority_user & (1<<0))>0) return false; // banned
    if (A.id == 1) return true; // root user
    if (Bid == 1) return false; // cannot edit root
    if (A.id == Bid) return true; // edit self
    if ((A.authority_admin & (1|(1<<4))) > 0) return true;
    return false;
  },
  user_can_edit_user: function(A,B) {
    if (!A) return false;
    if (!B) return false;
    if ((A.authority_user & (1<<0))>0) return false; // banned
    if (A.id == 1) return true; // root user
    if (B.id == 1) return false; // cannot edit root
    if (A.id == B.id) return true; // edit self
    if ((A.authority_admin & (1<<4))>0 && (B.authority_admin==0)) return true; // manage user
    if ((A.authority_admin & (1<<1))>0 && (B.authority_admin&(1<<1))==0) return true; // manage admin
    return false;
  },
  get_utc_time: function(str,offset) {
    return new Date((new Date(str)).getTime()+offset*60000);
  },
  get_diff_day: function(pre,now) {
    return Math.floor((now.getTime()-pre.getTime())/(1000*60*60*24));
  },
  in_range: function(a,L,R) {
    return (a>=L && a<=R);
  },
  get_abstract: get_abstract,
  unlink: function(pathname) {
    if (!pathname) return
    return fs.unlink(pathname,err=>{if(err)return})
  },
  // dynamic_follow_user_topic: function (users,user,topic) {
  //   let header = '你关注的 '+user.nickname+' 发表了新主题:';
  //   let content = get_abstract(topic.raw_content);
  //   let link = '/community/forums/topics'+topic.id;
  //   let show_avatar = user.avatar;
  //   let show_id = user.id;
  //   return Promise.all(users.map(user=>{return models.Dynamic.create({
  //     header: header,
  //     content: content,
  //     link: link,
  //     show_avatar: show_avatar,
  //     show_id: show_id,
  //     user_id: user.id
  //   })}))
  // },
  // dynamic_follow_user_user: function (users,userA,userB) {
  //   let header = '你关注的 '+userA.nickname+' 关注了 '+userB.nickname;
  //   let content = ' ';
  //   let link = '/users/'+userB.id;
  //   let show_avatar = userA.avatar;
  //   let show_id = userA.id;
  //   return Promise.all(users.map(user=>{return models.Dynamic.create({
  //     header: header,
  //     content: content,
  //     link: link,
  //     show_avatar: show_avatar,
  //     show_id: show_id,
  //     user_id: user.id
  //   })}))
  // },
  // dynamic_follow_you: function (user,follower) {
  //   let header = follower.nickname+' 关注了你';
  //   let content = ' ';
  //   let link = '/users/'+follower.id;
  //   let show_avatar = follower.avatar;
  //   let show_id = follower.id;
  //   return models.Dynamic.create({
  //     header: header,
  //     content: content,
  //     link: link,
  //     show_avatar: show_avatar,
  //     show_id: show_id,
  //     user_id: user.id
  //   })
  // },
  country_name: {
    "af": "Afghanistan",
    "ax": "Aland Islands",
    "al": "Albania",
    "dz": "Algeria",
    "as": "American Samoa",
    "ad": "Andorra",
    "ao": "Angola",
    "ai": "Anguilla",
    "ag": "Antigua",
    "ar": "Argentina",
    "am": "Armenia",
    "aw": "Aruba",
    "au": "Australia",
    "at": "Austria",
    "az": "Azerbaijan",
    "bs": "Bahamas",
    "bh": "Bahrain",
    "bd": "Bangladesh",
    "bb": "Barbados",
    "by": "Belarus",
    "be": "Belgium",
    "bz": "Belize",
    "bj": "Benin",
    "bm": "Bermuda",
    "bt": "Bhutan",
    "bo": "Bolivia",
    "ba": "Bosnia",
    "bw": "Botswana",
    "bv": "Bouvet Island",
    "br": "Brazil",
    "vg": "British Virgin Islands",
    "bn": "Brunei",
    "bg": "Bulgaria",
    "bf": "Burkina Faso",
    "mm": "Burma",
    "bi": "Burundi",
    "tc": "Caicos Islands",
    "kh": "Cambodia",
    "cm": "Cameroon",
    "ca": "Canada",
    "cv": "Cape Verde",
    "ky": "Cayman Islands",
    "cf": "Central African Republic",
    "td": "Chad",
    "cl": "Chile",
    "cn": "China",
    "cx": "Christmas Island",
    "cc": "Cocos Islands",
    "co": "Colombia",
    "km": "Comoros",
    "cd": "Congo",
    "cg": "Congo Brazzaville",
    "ck": "Cook Islands",
    "cr": "Costa Rica",
    "ci": "Cote Divoire",
    "hr": "Croatia",
    "cu": "Cuba",
    "cy": "Cyprus",
    "cz": "Czech Republic",
    "dk": "Denmark",
    "dj": "Djibouti",
    "dm": "Dominica",
    "do": "Dominican Republic",
    "ec": "Ecuador",
    "eg": "Egypt",
    "sv": "El Salvador",
    "gb eng": "England",
    "gq": "Equatorial Guinea",
    "er": "Eritrea",
    "ee": "Estonia",
    "et": "Ethiopia",
    "eu": "European Union",
    "fk": "Falkland Islands",
    "fo": "Faroe Islands",
    "fj": "Fiji",
    "fi": "Finland",
    "fr": "France",
    "gf": "French Guiana",
    "pf": "French Polynesia",
    "tf": "French Territories",
    "ga": "Gabon",
    "gm": "Gambia",
    "ge": "Georgia",
    "de": "Germany",
    "gh": "Ghana",
    "gi": "Gibraltar",
    "gr": "Greece",
    "gl": "Greenland",
    "gd": "Grenada",
    "gp": "Guadeloupe",
    "gu": "Guam",
    "gt": "Guatemala",
    "gn": "Guinea",
    "gw": "Guinea-bissau",
    "gy": "Guyana",
    "ht": "Haiti",
    "hm": "Heard Island",
    "hn": "Honduras",
    "hk": "Hong Kong",
    "hu": "Hungary",
    "is": "Iceland",
    "in": "India",
    "io": "Indian Ocean Territory",
    "id": "Indonesia",
    "ir": "Iran",
    "iq": "Iraq",
    "ie": "Ireland",
    "il": "Israel",
    "it": "Italy",
    "jm": "Jamaica",
    "sj": "Jan Mayen",
    "jp": "Japan",
    "jo": "Jordan",
    "kz": "Kazakhstan",
    "ke": "Kenya",
    "ki": "Kiribati",
    "kw": "Kuwait",
    "kg": "Kyrgyzstan",
    "la": "Laos",
    "lv": "Latvia",
    "lb": "Lebanon",
    "ls": "Lesotho",
    "lr": "Liberia",
    "ly": "Libya",
    "li": "Liechtenstein",
    "lt": "Lithuania",
    "lu": "Luxembourg",
    "mo": "Macau",
    "mk": "Macedonia",
    "mg": "Madagascar",
    "mw": "Malawi",
    "my": "Malaysia",
    "mv": "Maldives",
    "ml": "Mali",
    "mt": "Malta",
    "mh": "Marshall Islands",
    "mq": "Martinique",
    "mr": "Mauritania",
    "mu": "Mauritius",
    "yt": "Mayotte",
    "mx": "Mexico",
    "fm": "Micronesia",
    "md": "Moldova",
    "mc": "Monaco",
    "mn": "Mongolia",
    "me": "Montenegro",
    "ms": "Montserrat",
    "ma": "Morocco",
    "mz": "Mozambique",
    "na": "Namibia",
    "nr": "Nauru",
    "np": "Nepal",
    "nl": "Netherlands",
    "an": "Netherlands Antilles",
    "nc": "New Caledonia",
    "pg": "New Guinea",
    "nz": "New Zealand",
    "ni": "Nicaragua",
    "ne": "Niger",
    "ng": "Nigeria",
    "nu": "Niue",
    "nf": "Norfolk Island",
    "kp": "North Korea",
    "mp": "Northern Mariana Islands",
    "no": "Norway",
    "om": "Oman",
    "pk": "Pakistan",
    "pw": "Palau",
    "ps": "Palestine",
    "pa": "Panama",
    "py": "Paraguay",
    "pe": "Peru",
    "ph": "Philippines",
    "pn": "Pitcairn Islands",
    "pl": "Poland",
    "pt": "Portugal",
    "pr": "Puerto Rico",
    "qa": "Qatar",
    "re": "Reunion",
    "ro": "Romania",
    "ru": "Russia",
    "rw": "Rwanda",
    "sh": "Saint Helena",
    "kn": "Saint Kitts And Nevis",
    "lc": "Saint Lucia",
    "pm": "Saint Pierre",
    "vc": "Saint Vincent",
    "ws": "Samoa",
    "sm": "San Marino",
    "gs": "Sandwich Islands",
    "st": "Sao Tome",
    "sa": "Saudi Arabia",
    "gb sct": "Scotland", 
    "sn": "Senegal",
    "cs": "Serbia",
    "rs": "Serbia",
    "sc": "Seychelles",
    "sl": "Sierra Leone",
    "sg": "Singapore",
    "sk": "Slovakia",
    "si": "Slovenia",
    "sb": "Solomon Islands",
    "so": "Somalia",
    "za": "South Africa",
    "kr": "South Korea",
    "es": "Spain",
    "lk": "Sri Lanka",
    "sd": "Sudan",
    "sr": "Suriname",
    "sz": "Swaziland",
    "se": "Sweden",
    "ch": "Switzerland",
    "sy": "Syria",
    "tw": "Taiwan",
    "tj": "Tajikistan",
    "tz": "Tanzania",
    "th": "Thailand",
    "tl": "Timorleste",
    "tg": "Togo",
    "tk": "Tokelau",
    "to": "Tonga",
    "tt": "Trinidad",
    "tn": "Tunisia",
    "tr": "Turkey",
    "tm": "Turkmenistan",
    "tv": "Tuvalu",
    "ae": "U.A.E",
    "ug": "Uganda",
    "ua": "Ukraine",
    "gb": "United Kingdom",
    "us": "United States",
    "uy": "Uruguay",
    "um": "Us Minor Islands",
    "vi": "Us Virgin Islands",
    "uz": "Uzbekistan",
    "vu": "Vanuatu",
    "va": "Vatican City",
    "ve": "Venezuela",
    "vn": "Vietnam",
    "gb wls": "Wales",
    "wf": "Wallis And Futuna",
    "eh": "Western Sahara",
    "ye": "Yemen",
    "zm": "Zambia",
    "zw": "Zimbabwe"
  }
}
