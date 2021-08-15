const Discord = require("discord.js");
const fs = require('fs')
const client = new Discord.Client();
const CF = require('./config')
const GK = require('./guvenilirliste.json')
let yetkiler = ["ADMINISTRATOR", "BAN_MEMBERS", "KICK_MEMBERS", "MANAGE_ROLES", "MANAGE_CHANNELS", "MANAGE_GUILD", "VIEW_AUDIT_LOG"]



client.on("message", async(message) => {
if (!message.guild || message.author.bot || message.channel.type === 'dm') return;
let prefix = CF.Prefix.filter(p => message.content.startsWith(p))[0]; 
if (!prefix) return;
let args = message.content.split(' ').slice(1);
let command = message.content.split(' ')[0].slice(prefix.length); 

let embed = new Discord.MessageEmbed().setColor('RANDOM')

if(command === "güvenli") {
if (message.author.id !== CF.OwnerID) return    
let member = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
let guvenilirliste = GK.Guvenilir || []
if(!member) return message.channel.send(embed.setDescription(`Lütfen bir üye belirtin.`).setAuthor(message.guild.name, message.guild.iconURL({dynamic:true}))).then(x => x.delete({timeout:5000}))
if (guvenilirliste.some(g => g.includes(member.id))) {
guvenilirliste = guvenilirliste.filter(g => !g.includes(member.id));
GK.Guvenilir = guvenilirliste;
fs.writeFile("./guvenilirliste.json", JSON.stringify(GK), (err) => {if (err) console.log(err)})
message.channel.send(embed.setDescription(`${member} artık güvenli listede değil. 🚫`).setAuthor(message.guild.name, message.guild.iconURL({dynamic:true})))
} else {
GK.Guvenilir.push(`${member.id}`);
fs.writeFile("./guvenilirliste.json", JSON.stringify(GK), (err) => {if (err) console.log(err)});
message.channel.send(embed.setDescription(`${member} artık güvenli listede. ✅`).setAuthor(message.guild.name, message.guild.iconURL({dynamic:true})))}
};

if(command === 'güvenli-liste' || command === 'liste') { 
let guvenilirliste = GK.Guvenilir || [] 
GK.Guvenilir = guvenilirliste;
let gmap = guvenilirliste > 0 ? guvenilirliste.map(x => message.guild.members.cache.get(x.slice(1)) ? message.guild.members.cache.get(x.slice(1)) : x).join(`\n`) : "Listede kimse yok." 
message.channel.send(embed.addField("Güvenli Liste", guvenilirliste.length > 0 ? guvenilirliste.map(g => (message.guild.members.cache.has(g.slice(1)) ? (message.guild.members.cache.get(g.slice(1))) : g)).join('\n') : "Güvenilir listede kimse yok."))
}})

client.on("roleDelete", async (role) => {await role.guild.fetchAuditLogs({type: "ROLE_DELETE"}).then(async (audit) => {
let entry = audit.entries.first()
let person = entry.executor
if (Date.now() - entry.createdTimestamp > 5000) return;
if(!entry || !entry.executor || GK.Guvenilir.includes(entry.executor.id)) return;
client.channels.cache.get(CF.RolLog).send(`⛔️ ${person} (\`${person.id}\`) isimli kullanıcı rol sildi ve yasakladım !\n||@everyone||`)
role.guild.roles.cache.filter(a => yetkiler.some(x => a.permissions.has(x)) == true && role.guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !CF.BotRoles.includes(a.id)).map(z => {z.setPermissions(0)})
await role.guild.members.ban(person.id, {reason: "Guard (Rol Sildi)"}).catch(e => client.channels.cache.get(CF.RolLog).send(`🚫 ${person} isimli saldıran kişi rol sildi fakat yetkim yetmediği için **yasaklayamadım** !\n||@everyone||`))})
});

client.on("roleCreate", async (role) => {await role.guild.fetchAuditLogs({type: "ROLE_CREATE"}).then(async (audit) => {
let entry = audit.entries.first()
let person = entry.executor
if (Date.now() - entry.createdTimestamp > 5000) return;
if(!entry || !entry.executor || GK.Guvenilir.includes(entry.executor.id)) return;
client.channels.cache.get(CF.RolLog).send(`⛔️ ${person} (\`${person.id}\`) isimli kullanıcı rol oluşturdu ve yasakladım !\n||@everyone||`)
role.guild.roles.cache.filter(a => yetkiler.some(x => a.permissions.has(x)) == true && role.guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !CF.BotRoles.includes(a.id)).map(z => {z.setPermissions(0)})
await role.guild.members.ban(person.id, {reason: "Guard (Rol Açtı)"}).catch(e => client.channels.cache.get(CF.RolLog).send(`🚫 ${person} isimli saldıran kişi rol oluşturdu fakat yetkim yetmediği için **yasaklayamadım** !\n||@everyone||`))})
});

client.on("roleUpdate", async (oldRole, newRole) => {await newRole.guild.fetchAuditLogs({type: "ROLE_UPDATE"}).then(async (audit) => {
let entry = audit.entries.first()
let person = entry.executor
if (Date.now() - entry.createdTimestamp > 5000) return;
if(!entry || !entry.executor || GK.Guvenilir.includes(entry.executor.id)) return;
if (oldRole.name !== newRole.name) {
await newMember.roles.remove(role)     
client.channels.cache.get(CF.RolLog).send(`⛔️ ${person} (\`${person.id}\`) isimli kullanıcı rol ismini değiştirdi ve yasakladım !\n||@everyone||`)
newRole.guild.roles.cache.filter(a => yetkiler.some(x => a.permissions.has(x)) == true && newRole.guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !CF.BotRoles.includes(a.id)).map(z => {z.setPermissions(0)})
await newRole.guild.members.ban(person.id, {reason: "Guard (Rol İsmini Değiştirdi)"}).catch(e => client.channels.cache.get(CF.RolLog).send(`🚫 ${person} isimli saldıran kişi rol ismini değiştirdi fakat yetkim yetmediği için **yasaklayamadım** !\n||@everyone||`))
}
})
})

client.on("guildMemberUpdate", async (oldMember, newMember) => {await newMember.guild.fetchAuditLogs({type: "MEMBER_ROLE_UPDATE"}).then(async (audit) => {
let entry = audit.entries.first()
let verilen = entry.target 
let person = entry.executor
if (verilen.id != newMember.id) return
if (Date.now() - entry.createdTimestamp > 5000) return;
if(!entry || !entry.executor || GK.Guvenilir.includes(entry.executor.id)) return;
newMember.roles.cache.forEach(async role => {
if (yetkiler.some(p => !oldMember.hasPermission(p) && newMember.hasPermission(p))) {
newMember.roles.set(oldMember.roles.cache.map(r => r.id));
client.channels.cache.get(CF.RolLog).send(`⛔️ ${person} (\`${person.id}\`) isimli yetkili ${newMember} adlı kullanıcıya rol verdi rolü geri aldım ve yasakladım !\n||@everyone||`)
newMember.guild.roles.cache.filter(a => yetkiler.some(x => a.permissions.has(x)) == true && newMember.guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !CF.BotRoles.includes(a.id)).map(z => {z.setPermissions(0)})
await newMember.guild.members.ban(person.id, {reason: "Guard (Yetki Verdi/Aldı)"}).catch(e => client.channels.cache.get(CF.RolLog).send(`🚫 ${person} isimli yetkili ${newMember} adlı kullanıcıya rol verdi fakat yetkim yetmediği için **yasaklayamadım** !\n||@everyone||`))}
})
})
});

client.on("roleUpdate", async (oldRole, newRole) => {await newRole.guild.fetchAuditLogs({type: "ROLE_UPDATE"}).then(async (audit) => {
let entry = audit.entries.first()
let person = entry.executor
if (Date.now() - entry.createdTimestamp > 5000) return;
if(!entry || !entry.executor || GK.Guvenilir.includes(entry.executor.id)) return;
if (oldRole.permissions !== newRole.permissions) {
if (yetkiler.some(x => newRole.permissions.has(x)) == true) {    
newRole.setPermissions(0);
}
client.channels.cache.get(CF.RolLog).send(`⛔️ ${person} (\`${person.id}\`) isimli kullanıcı role yetki verdi ve yasakladım !\n||@everyone||`)
newRole.guild.roles.cache.filter(a => yetkiler.some(x => a.permissions.has(x)) == true && newRole.guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !CF.BotRoles.includes(a.id)).map(z => {z.setPermissions(0)})
await newRole.guild.members.ban(person.id, {reason: "Guard (Role Yetki Verdi)"}).catch(e => client.channels.cache.get(CF.RolLog).send(`🚫 ${person} isimli saldıran kişi role yetki verdi fakat yetkim yetmediği için **yasaklayamadım** !\n||@everyone||`))}
})
});

client.on("channelDelete", async (channel) => {await channel.guild.fetchAuditLogs({type: "CHANNEL_DELETE"}).then(async (audit) => {
let entry = audit.entries.first()
let person = entry.executor
if (Date.now() - entry.createdTimestamp > 5000) return;
if(!entry || !entry.executor || GK.Guvenilir.includes(entry.executor.id)) return;
client.channels.cache.get(CF.ChannelLog).send(`⛔️ ${person} (\`${person.id}\`) isimli kullanıcı kanal sildi ve yasakladım !\n||@everyone||`)
channel.guild.roles.cache.filter(a => yetkiler.some(x => a.permissions.has(x)) == true && channel.guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !CF.BotRoles.includes(a.id)).map(z => {z.setPermissions(0)})
await channel.guild.members.ban(person.id, {reason: "Guard (Kanal Sildi)"}).catch(e => client.channels.cache.get(CF.ChannelLog).send(`🚫 ${person} isimli saldıran kişi kanal sildi fakat yetkim yetmediği için **yasaklayamadım** !\n||@everyone||`))})
});

client.on("channelCreate", async (channel) => {await channel.guild.fetchAuditLogs({type: "CHANNEL_CREATE"}).then(async (audit) => {
let entry = audit.entries.first()
let person = entry.executor
if (Date.now() - entry.createdTimestamp > 5000) return;
if(!entry || !entry.executor || GK.Guvenilir.includes(entry.executor.id)) return;
client.channels.cache.get(CF.ChannelLog).send(`⛔️ ${person} (\`${person.id}\`) isimli kullanıcı kanal oluşturdu ve yasakladım !\n||@everyone||`)
channel.guild.roles.cache.filter(a => yetkiler.some(x => a.permissions.has(x)) == true && channel.guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !CF.BotRoles.includes(a.id)).map(z => {z.setPermissions(0)})
await channel.guild.members.ban(person.id, {reason: "Guard (Kanal Açtı)"}).catch(e => client.channels.cache.get(CF.ChannelLog).send(`🚫 ${person} isimli saldıran kişi kanal oluşturdu fakat yetkim yetmediği için **yasaklayamadım** !\n||@everyone||`))})
});


client.on("channelUpdate", async (oldChannel, newChannel) => {newChannel.guild.fetchAuditLogs({type: "CHANNEL_OVERWRITE_UPDATE"}).then(async audit => {
let entry = audit.entries.first()
let person = entry.executor
if (Date.now() - entry.createdTimestamp > 5000) return;
if(!entry || !entry.executor || GK.Guvenilir.includes(entry.executor.id)) return;
if (oldChannel.permissionOverwrites !== newChannel.permissionOverwrites) {
let everyonePerm = newChannel.permissionOverwrites.filter(p => p.id == newChannel.guild.id).map(x => (x.allow.bitfield));
let everyonePermission = new Discord.Permissions(everyonePerm[0]).toArray();
let olDeveryonePerm = oldChannel.permissionOverwrites.filter(p => p.id == newChannel.guild.id).map(x => (x.allow.bitfield));
let olDeveryonePermission = new Discord.Permissions(olDeveryonePerm[0]).toArray();
if (olDeveryonePermission.includes("MENTION_EVERYONE") || olDeveryonePermission.includes("MANAGE_CHANNELS"))
if (everyonePermission.includes("MENTION_EVERYONE") || everyonePermission.includes("MANAGE_CHANNELS")) 
newChannel.guild.roles.cache.filter(a => yetkiler.some(x => a.permissions.has(x)) == true && newChannel.guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !CF.BotRoles.includes(a.id)).map(z => {z.setPermissions(0)})
client.channels.cache.get(CF.ChannelLog).send(`⛔️ ${person} (\`${person.id}\`) isimli kullanıcı kanal ayarlarını değiştirdi ve yasakladım !\n||@everyone||`)
await newChannel.guild.members.ban(person.id, {reason: "Guard (Kanal İsmi Değişti)"}).catch(e => client.channels.cache.get(CF.ChannelLog).send(`🚫 ${person} isimli saldıran kişi kanal ayarlarını değiştirdi fakat yetkim yetmediği için **yasaklayamadım** !\n||@everyone||`))}
newChannel.permissionOverwrites.map(async (x) => await x.delete().then(x => newChannel.overwritePermissions([{id: newChannel.guild.id,deny: ["VIEW_CHANNEL"]}], "Koruma")));
})});



client.on("channelUpdate", async (oldChannel, newChannel) => {await newChannel.guild.fetchAuditLogs({type: "CHANNEL_UPDATE"}).then(async (audit) => {
let entry = audit.entries.first()
let person = entry.executor
if (Date.now() - entry.createdTimestamp > 5000) return;
if(!entry || !entry.executor || GK.Guvenilir.includes(entry.executor.id)) return;
client.channels.cache.get(CF.ChannelLog).send(`⛔️ ${person} (\`${person.id}\`) isimli kullanıcı kanal ismini değiştirdi ve yasakladım !\n||@everyone||`)
newChannel.guild.roles.cache.filter(a => yetkiler.some(x => a.permissions.has(x)) == true && newChannel.guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !CF.BotRoles.includes(a.id)).map(z => {z.setPermissions(0)})
await newChannel.guild.members.ban(person.id, {reason: "Guard (Kanal İsmi Değişti)"}).catch(e => client.channels.cache.get(CF.ChannelLog).send(`🚫 ${person} isimli saldıran kişi kanal ismini değiştirdi fakat yetkim yetmediği için **yasaklayamadım** !\n||@everyone||`))})
if (newChannel.type !== "category" && newChannel.parentID !== oldChannel.parentID) newChannel.setParent(oldChannel.parentID);
if (newChannel.type === "category") {
newChannel.edit({name: oldChannel.name});
} else if (newChannel.type === "text") {
newChannel.edit({name: oldChannel.name, topic: oldChannel.topic, nsfw: oldChannel.nsfw, rateLimitPerUser: oldChannel.rateLimitPerUser});
} else if (newChannel.type === "voice") {
newChannel.edit({name: oldChannel.name, bitrate: oldChannel.bitrate, userLimit: oldChannel.userLimit,})};
oldChannel.permissionOverwrites.forEach(perm => {
let thisPermOverwrites = {};
perm.allow.toArray().forEach(p => {thisPermOverwrites[p] = true;});
perm.deny.toArray().forEach(p => {thisPermOverwrites[p] = false;})
newChannel.createOverwrite(perm.id, thisPermOverwrites);});
});

client.on("guildUnavailable", async (guild) => {
guild.guild.roles.cache.filter(a => yetkiler.some(x => a.permissions.has(x)) == true && newChannel.guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !CF.BotRoles.includes(a.id)).map(z => {z.setPermissions(0)})
client.channels.cache.get(CF.ServerLog).send(`Sunucu düştüğü için yetkiler kapatıldı !\n||@everyone||`)});


client.on("guildUpdate", async (oldGuild, newGuild) => {await newGuild.fetchAuditLogs({type: "GUILD_UPDATE"}).then(async (audit) => {
let entry = audit.entries.first();
let hedef = entry.target;
let person = entry.executor;
if (Date.now() - entry.createdTimestamp > 5000) return;
if(!entry || !entry.executor || GK.Guvenilir.includes(entry.executor.id)) return;
if (newGuild.iconURL({dynamic: true, size: 2048}) !== oldGuild.iconURL({dynamic: true, size: 2048})) newGuild.setIcon(oldGuild.iconURL({dynamic: true, size: 2048}));
if (oldGuild.name !== newGuild.name) {
newGuild.setName(oldGuild.name);
newGuild.members.ban(person.id, {reason: "Sunucu ismi değiştirmek."}).catch(e => client.channels.cache.get(CF.ServerLog).send(`⛔️ ${person} \`${person.id}\` Sunucunun ismini değiştirmeye çalıştı yetkim yetmediği için banlayamadım. !\n||@everyone||`))
client.channels.cache.get(CF.ServerLog).send(`⛔️ ${person} \`${person.id}\` Sunucunun ismini değiştirmeye çalıştı eski haline geri döndürdüm. !\n||@everyone||`)}
newGuild.guild.roles.cache.filter(a => yetkiler.some(x => a.permissions.has(x)) == true && newGuild.guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !CF.BotRoles.includes(a.id)).map(z => {z.setPermissions(0)})
if (oldGuild.vanityURLCode !== newGuild.vanityURLCode) {newGuild.members.ban(person.id, {reason: "Sunucu ÖZEL URL değiştirmek."}).catch(e => client.channels.cache.get(CF.ServerLog).send(`⛔️ ${person} \`${person.id}\` isimli kullanıcı sunucunun ismini değiştirdi düzelltim fakat yetkim yetmediği için yasaklayamadım !\n||@everyone||`))} 
})
})


/* URLNİZ VARSA / İŞARETLERİNİ VE * KALDIRIN  
client.on("guildUpdate", async (oldGuild, newGuild) => {
let url = CF.SunucuUrl
if (newGuild.vanityURLCode == url) return
if (oldGuild.vanityURLCode !== newGuild.vanityURLCode) {
let snc = await oldGuild.fetchAuditLogs({type: "GUILD_UPDATE"})
let entry = oldGuild.members.cache.get(snc.entries.first().executor.id)
axios({method: "patch", url: `https://discord.com/api/v6/guilds/${oldGuild.id}/vanity-url`, data: {code: url}, headers: {authorization: `Bot ${client.token}`}}).then(() => {
newGuild.guild.roles.cache.filter(a => yetkiler.some(x => a.permissions.has(x)) == true && newGuild.guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !CF.BotRoles.includes(a.id)).map(z => {z.setPermissions(0)})
client.channels.cache.get(CF.ServerLog).send(`⛔️ ${entry} (\`${entry.id}\`) isimli kullanıcı sunucununu URL'sini değiştirmeye çalıştı geri aldım ve yasakladım !\n||@everyone||`)
newGuild.members.ban(entry.id).catch(e => client.channels.cache.get(CF.ServerLog).send(`⛔️ ${entry} (\`${entry.id}\`) isimli kullanıcı sunucununu URL'sini değiştirdi üst yetkili olduğu için bir şey yapamadım !\n||@everyone||`))}).catch(e => {
newGuild.members.ban(entry.id).catch(e => client.channels.cache.get(CF.ServerLog).send(`⛔️ ${entry} (\`${entry.id}\`) isimli kullanıcı sunucununu URL'sini değiştirdi üst yetkili olduğu için bir şey yapamadım !\n||@everyone||`)); console.error(e)})}})
*/

client.on("guildBanAdd", async function(guild, user) {await guild.fetchAuditLogs({type: 'MEMBER_BAN_ADD'}).then(audit => audit.entries.first());
let entry = audit.entries.first();
let banned = entry.target
let person = entry.executor;
if (Date.now() - entry.createdTimestamp > 5000) return;
if(!entry || !entry.executor || GK.Guvenilir.includes(entry.executor.id)) return;
guild.roles.cache.filter(a => yetkiler.some(x => a.permissions.has(x)) == true && guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !CF.BotRoles.includes(a.id)).map(z => {z.setPermissions(0)})
client.channels.cache.get(CF.ServerLog).send(`⛔️ ${person} (\`${person.id}\`) adlı yetkili tarafından <@${banned.id}> (\`${banned.id}\`) kullanıcısına ban atıldı banı kaldırdım ve yetkiliyi yasakladım !\n||@everyone||`)
await guild.members.ban(person.id, {reason: "Guard (Sağ Tık Ban)" }).catch(e => client.channels.cache.get(CF.ServerLog).send(`⛔️ ${person} sağ tık ban attı yetkim yetmediği için yasaklayamadım !\n||@everyone||`))
})

client.on("guildMemberRemove", async function(member) {await member.guild.fetchAuditLogs({type: 'MEMBER_KICK'}).then(audit => audit.entries.first());
let entry = audit.entries.first();
let banned = entry.target
let person = entry.executor;
if (Date.now() - entry.createdTimestamp > 5000) return;
if(!entry || !entry.executor || GK.Guvenilir.includes(entry.executor.id)) return;
member.guild.roles.cache.filter(a => yetkiler.some(x => a.permissions.has(x)) == true && member.guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !CF.BotRoles.includes(a.id)).map(z => {z.setPermissions(0)})
client.channels.cache.get(CF.ServerLog).send(`⛔️ ${person} (\`${person.id}\`) adlı yetkili tarafından <@${banned.id}> (\`${banned.id}\`) kullanıcısına kick atıldı banı kaldırdım ve yetkiliyi yasakladım !\n||@everyone||`)
await member.guild.members.ban(person.id, {reason: "Guard (Sağ Tık Ban)" }).catch(e => client.channels.cache.get(CF.ServerLog).send(`⛔️ ${person} sağ tık kick attı yetkim yetmediği için yasaklayamadım !\n||@everyone||`))
})


client.login(CF.Token).then(function(){console.log(`${client.user.tag} açıldı`)}, function(err){console.log('Token geçersiz.')})
