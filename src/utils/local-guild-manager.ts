import Database from 'better-sqlite3';
import path from 'path';
import { LocalGuild } from '../models/local-guild.model';

const db = new Database(path.join(__dirname, '../../saves/local_guild.db'), {
  verbose: console.log,
});

const localGuilds = `CREATE TABLE IF NOT EXISTS Local_guilds (
  guildId VARCHAR(30) PRIMARY KEY,
  categoryId VARCHAR(30),
  creatingChannelId VARCHAR(30),
  commandsChannelId VARCHAR(30)
);`;
db.exec(localGuilds);

export function getLocalGuild(guildId: string): LocalGuild {
  const localGuild = 'SELECT * FROM Local_guilds WHERE guildId = ?';
  return db.prepare(localGuild).get(guildId);
}

export function addLocalGuild(localGuild: LocalGuild) {
  const newLocalGuild =
    'INSERT INTO Local_guilds (guildId, categoryId, creatingChannelId, commandsChannelId) VALUES (@guildId, @categoryId, @creatingChannelId, @commandsChannelId)';
  return db.prepare(newLocalGuild).run(localGuild);
}

export function addLocalGuildId(guildId: string) {
  const newLocalGuild = 'INSERT INTO Local_guilds (guildId) VALUES (@guildId)';
  db.prepare(newLocalGuild).run({ guildId });
}

export function editCategoryId(guildId: string, categoryId: string) {
  const updateCategoryId =
    'UPDATE Local_guilds SET categoryId = ? WHERE guildId = ?';
  db.prepare(updateCategoryId).run([guildId, categoryId]);
}

export function editCreatingChannelId(
  guildId: string,
  creatingChannelId: string
) {
  const updateCreatingChannelId =
    'UPDATE Local_guilds SET creatingChannelId = ? WHERE guildId = ?';
  db.prepare(updateCreatingChannelId).run([guildId, creatingChannelId]);
}

export function editCommandsChannelId(
  guildId: string,
  commandsChannelId: string
) {
  const updateCommandsChannelId =
    'UPDATE Local_guilds SET commandsChannelId = ? WHERE guildId = ?';
  db.prepare(updateCommandsChannelId).run([guildId, commandsChannelId]);
}
