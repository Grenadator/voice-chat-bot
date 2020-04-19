import * as discord from 'discord.js';
import * as dotenv from 'dotenv';
import { addOwning, removeOwning, getOwner } from './utils/owning-manager';

dotenv.config();
const voiceChatBot = new discord.Client();

voiceChatBot.on('message', (msg) => {
  const cmdVoice = process.env.CMD_VOICE;
  if (cmdVoice && msg.content.startsWith(cmdVoice)) {
    // We have to check if the user is in a channel & if he owns it
    const channel = msg.member?.voice.channel;
    if (channel) {
      const { userId } = getOwner(channel.id);
      if (userId === msg.author.id) {
        const cmdAndArgs = msg.content.replace(cmdVoice, '').trim().split(' ');
        const cmd = cmdAndArgs.shift();
        const args = cmdAndArgs.join(' ').trim();
        switch (cmd) {
          case 'name':
            channel.edit({ name: args }, 'Voice Bot: Asked by his owner');
            break;
        }
      } else {
        msg.channel.send('You have to own this channel to run commands');
      }
    } else {
      msg.channel.send('You have to be in a voice channel to run commands.');
    }
  }
});

voiceChatBot.on('voiceStateUpdate', async (oldState, newState) => {
  // Create a voice channel when a user join the "creating" channel
  if (newState.channelID === process.env.CREATING_CHANNEL_ID) {
    try {
      // We create the channel
      const creator = await newState.guild.members.fetch(newState.id);
      const newGuildChannel = await newState.guild.channels.create(
        `${creator.user.username}'s channel`,
        { type: 'voice', parent: process.env.VOICE_CATEGORY_ID }
      );
      // We move the user inside his new channel
      const newChannel = await newGuildChannel.fetch();
      newState.setChannel(newChannel, 'A user creates a new channel');
      addOwning({
        userId: newState.id,
        ownedChannelId: newChannel.id,
      });
    } catch (error) {
      console.error(error);
    }
  }

  // Having null as an old state channel id means that the user wasn't in a vocal channel before
  if (oldState.channelID) {
    const channelLeft = newState.guild.channels.resolve(oldState.channelID);
    let memberCount = 0;
    for (const _ of channelLeft!.members) memberCount++;
    if (
      channelLeft &&
      !memberCount &&
      channelLeft.id !== process.env.CREATING_CHANNEL_ID
    ) {
      removeOwning(channelLeft.id);
      channelLeft
        .delete('Channel empty')
        .then(() => console.log('channel deleted'))
        .catch(console.error);
    }
  }
});

voiceChatBot.login(process.env.TOKEN);
