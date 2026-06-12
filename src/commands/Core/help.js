import {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from "discord.js";
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { createEmbed } from "../../utils/embeds.js";
import {
    createSelectMenu,
} from "../../utils/components.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATEGORY_SELECT_ID = "help-category-select";
const ALL_COMMANDS_ID = "help-all-commands";
const BUG_REPORT_BUTTON_ID = "help-bug-report";
const HELP_MENU_TIMEOUT_MS = 5 * 60 * 1000;

const CATEGORY_ICONS = {
    Core: "ℹ️",
    Moderation: "🛡️",
    Economy: "💰",
    Fun: "🎮",
    Leveling: "📊",
    Karışık: "🔧",
    Ticket: "🎫",
    Karşılama: "👋",
    Çekiliş: "🎉",
    Sayaç: "🔢",
    Tools: "🛠️",
    Search: "🔍",
    Reaction_roles: "🎭",
    Community: "👥",
    Birthday: "🎂",
    Config: "⚙️",
};





export async function createInitialHelpMenu(client) {
    const commandsPath = path.join(__dirname, "../../commands");
    const categoryDirs = (
        await fs.readdir(commandsPath, { withFileTypes: true })
    )
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)
        .sort();

    const options = [
        {
            label: "📋 All Commands",
            description: "View all available commands with pagination",
            value: ALL_COMMANDS_ID,
        },
        ...categoryDirs.map((category) => {
            const categoryName =
                category.charAt(0).toUpperCase() +
                category.slice(1).toLowerCase();
            const icon = CATEGORY_ICONS[categoryName] || "🔍";
            return {
                label: `${icon} ${categoryName}`,
                description: `View commands in the ${categoryName} category`,
                value: category,
            };
        }),
    ];

    const botName = client?.user?.username || "Bot";
    const embed = createEmbed({ 
        title: `🤖 ${botName} Help Center`,
        description: "Your all-in-one Discord companion for moderation, economy, fun, and server management.",
        color: 'primary'
    });

    embed.addFields(
        {
            name: "🛡️ **Moderasyon**",
            value: "Sunucu denetimi, kullanıcı yönetimi ve uygulama araçları",
            inline: true
        },
        {
            name: "💰 **Ekonomi**",
            value: "Para sistemi ve mağaza",
            inline: true
        },
        {
            name: "🎮 **Eğlence**",
            value: "Oyunlar, eğlence ve etkileşimli komutlar",
            inline: true
        },
        {
            name: "📊 **Seviye**",
            value: "Kullanıcı seviyeleri, XP sistemi ve ilerleme takibi",
            inline: true
        },
        {
            name: "🎫 **Ticket**",
            value: "Sunucu yönetimi için destek talebi sistemi",
            inline: true
        },
        {
            name: "🎉 **Çekiliş**",
            value: "Otomatik ve zamanlayıcılı çekiliş başlatma sistemi",
            inline: true
        },
        {
            name: "👋 **Karşılama**",
            value: "Üye karşılama mesajları ve yeni üyelere yönelik oryantasyon programı",
            inline: true
        },
        {
            name: "🎂 **Doğum Günü**",
            value: "Doğum günü takibi ve kutlama özellikleri",
            inline: true
        },
        {
            name: "👥 **Topluluk**",
            value: "Topluluk araçları, uygulamaları ve üye etkileşimi",
            inline: true
        },
        {
            name: "⚙️ **Config**",
            value: "Sunucu ve bot yapılandırma yönetimi komutları",
            inline: true
        },
        {
            name: "🔢 **Sayaç**",
            value: "Canlı sayaç kanalı kurulumu ve sayaç kontrolleri",
            inline: true
        },
        {
            name: "🎙️ **Özel ses kanalı**",
            value: "Özel ses kanalı oluşturma ve yönetimi",
            inline: true
        },
        {
            name: "🎭 **Tepki Rolleri**",
            value: "Tepki aracılığı ile rol atama sistemi",
            inline: true
        },
        {
            name: "✅ **Doğrulama**",
            value: "Üye doğrulama ve bot erişim kısıtlamaları",
            inline: true
        },
        {
            name: "🔧 **Araç Gereç**",
            value: "Faydalı araçlar ve sunucu yardımcı programları",
            inline: true
        }
    );

    embed.setFooter({ 
        text: "Made with ❤️" 
    });
    embed.setTimestamp();

    const bugReportButton = new ButtonBuilder()
        .setCustomId(BUG_REPORT_BUTTON_ID)
        .setLabel("Report Bug")
        .setStyle(ButtonStyle.Danger);

    const supportButton = new ButtonBuilder()
        .setLabel("Support Server")
        .setURL("https://discord.gg/QnWNz2dKCE")
        .setStyle(ButtonStyle.Link);

    const touchpointButton = new ButtonBuilder()
        .setLabel("Learn from Touchpoint")
        .setURL("https://www.youtube.com/@TouchDisc")
        .setStyle(ButtonStyle.Link);

    const selectRow = createSelectMenu(
        CATEGORY_SELECT_ID,
        "Select to view the commands",
        options,
    );

    const buttonRow = new ActionRowBuilder().addComponents([
        bugReportButton,
        supportButton,
        touchpointButton,
    ]);

    return {
        embeds: [embed],
        components: [buttonRow, selectRow],
    };
}

export default {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Displays the help menu with all available commands"),

    async execute(interaction, guildConfig, client) {
        
        const { MessageFlags } = await import('discord.js');
        await InteractionHelper.safeDefer(interaction);
        
        const { embeds, components } = await createInitialHelpMenu(client);

        await InteractionHelper.safeEditReply(interaction, {
            embeds,
            components,
        });

        setTimeout(async () => {
            try {
                const closedEmbed = createEmbed({
                    title: "Help menu closed",
                    description: "Help menu has been closed, use /help again.",
                    color: "secondary",
                });

                await InteractionHelper.safeEditReply(interaction, {
                    embeds: [closedEmbed],
                    components: [],
                });
            } catch (error) {
                
            }
        }, HELP_MENU_TIMEOUT_MS);
    },
};


