const fetch = require('node-fetch');

module.exports = (bot) => {
  bot.cooldowns = {};

  bot.err = (msg, error, tell = true) => {
    
    if (
      error.message.startsWith('Request timed out') ||
      error.code == 500 ||
      error.code == 'ECONNRESET' ||
      error.code == 'EHOSTUNREACH'
    )
      return; //Internal discord errors don't need reporting
    bot.logger.error(
      `ch:${msg.channel.id} usr:${msg.author ? msg.author.id : 'UNKNOWN'}]\n(${
        error.code
      }) ${error.stack} `
    );
    if (tell && msg.channel)
      bot
        .send(
          msg.channel,
          `There was an error performing the operation. Please report this to the support server if issues persist. (${
            error.code || error.message
          })`
        )
        .catch((e) => {});
    bot.sentry.captureException(error);
  };

  bot.ageOf = (user) => {
    return (Date.now() - user.createdAt) / (1000 * 60 * 60 * 24);
  };

  bot.resolveUser = async (msg, text) => {
    let uid = (/<@!?(\d+)>/.test(text) && text.match(/<@!?(\d+)>/)[1]) || text;
    if (/^\d+$/.test(uid)) {
      let target = null;
      target = await bot.getRESTUser(uid).catch((e) => {
        if (e.code != 10013) throw e;
        return null;
      }); //return null if user wasn't found, otherwise throw
      if (target && target.user) target = target.user;
      return target;
    } else return null;
  };

  bot.resolveChannel = (msg, text) => {
    let g = msg.channel.guild;
    return (
      g.channels.get(/<#(\d+)>/.test(text) && text.match(/<#(\d+)>/)[1]) ||
      g.channels.get(text)
    ); /*|| g.channels.find(m => m.name.toLowerCase() == text.toLowerCase())*/
  };

  bot.waitMessage = (msg) => {
    return new Promise((res, rej) => {
      bot.dialogs[msg.channel.id + msg.author.id] = res;
      setTimeout(() => {
        if (bot.dialogs[msg.channel.id + msg.author.id] != undefined) {
          delete bot.dialogs[msg.channel.id + msg.author.id];
          rej('timeout');
        }
      }, 10000);
    });
  };

  bot.confirm = async (msg, text) => {
    let response;
    try {
      await bot.send(msg.channel, text);
      response = await bot.waitMessage(msg);
      if (response.content.toLowerCase() != 'yes')
        return 'Canceling operation.';
    } catch (e) {
      if (e == 'timeout') return 'Response timed out. Canceling.';
      else throw e;
    }
    return true;
  };

  bot.send = async (channel, message, file, retry = 2) => {
    if (!channel.id) return;
    let msg;
    try {
      if (bot.announcement && message.embed) {
        if (!message.content) message.content = '';
        message.content += '\n' + bot.announcement;
      }
      msg = await channel.createMessage(message, file);
    } catch (e) {
      if (
        e.message.startsWith('Request timed out') ||
        (e.code >= 500 && e.code <= 599) ||
        e.code == 'EHOSTUNREACH'
      ) {
        if (retry > 0) return bot.send(channel, message, file, retry - 1);
        else return;
      } else throw e;
    }
    return msg;
  };

  bot.sanitizeName = (name) => {
    return name.trim();
  };

  bot.noVariation = (word) => {
    return word.replace(/[\ufe0f]/g, '');
  };

  bot.getMatches = (string, regex) => {
    var matches = [];
    var match;
    while ((match = regex.exec(string))) {
      match.splice(1).forEach((m) => {
        if (m) matches.push(m);
      });
    }
    return matches;
  };

  bot.ignoreDeletion = (e) => {
    if (e.code != 10008) throw e;
  };
};
