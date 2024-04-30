/*
* Script Name: Attack Plan Creator
* Version: v1.0
* Last Updated: 2024-04-30
* Author: SaveBank
* Author Contact: Discord: savebank 
* Approved: 
* Approved Date:
* Mod: 
*/

// User Input
if (typeof DEBUG !== 'boolean') DEBUG = false;

var allIdsAPC = [];

var scriptConfig = {
    scriptData: {
        prefix: 'sbAPC',
        name: 'Attack Plan Creator',
        version: 'v1.0',
        author: 'SaveBank',
        authorUrl: 'https://forum.tribalwars.net/index.php?members/savebank.131111/',
        helpLink: '',
    },
    translations: {
        en_DK: {
            'Can only be used in the village overview or incoming screen!': 'Can only be used in the village overview or incoming screen!',
            Help: 'Help',
            'Attack Plan Creator': 'Attack Plan Creator',
            'There was an error!': 'There was an error!',
        },
        de_DE: {
            'Can only be used in the village overview or incoming screen!': 'Kann nur im Dorf oder in Eintreffende Befehle verwendet werden!',
            Help: 'Hilfe',
            'Attack Plan Creator': 'Angriffsplanersteller',
            'There was an error!': 'Es gab einen Fehler!',
        }
    }
    ,
    allowedMarkets: [],
    allowedScreens: ['overview_villages', 'overview'],
    allowedModes: [],
    isDebug: DEBUG,
    enableCountApi: false
};



$.getScript(`https://twscripts.dev/scripts/twSDK.js?url=${document.currentScript.src}`,
    async function () {
        const startTime = performance.now();
        if (DEBUG) {
            console.debug(`Init`);
        }
        await twSDK.init(scriptConfig);
        const scriptInfo = twSDK.scriptInfo();
        const isValidScreen = twSDK.checkValidLocation('screen');
        if (!isValidScreen) {
            UI.ErrorMessage(twSDK.tt('Can only be used in the village overview or incoming screen!'));
            return;
        }

        if (DEBUG) console.debug(`${scriptInfo}: Startup time: ${(performance.now() - startTime).toFixed(2)} milliseconds`);
        // Entry point
        (async function () {
            try {
                const startTime = performance.now();
                // renderUI();
                // addEventHandlers();
                // initializeInputFields();
                count();
                if (DEBUG) console.debug(`${scriptInfo}: Time to initialize: ${(performance.now() - startTime).toFixed(2)} milliseconds`);
            } catch (error) {
                UI.ErrorMessage(twSDK.tt('There was an error!'));
                console.error(`${scriptInfo}: Error:`, error);
            }
        })();

        function count() {
            const apiUrl = 'https://api.counterapi.dev/v1';
            const playerId = game_data.player.id;
            const encodedPlayerId = btoa(game_data.player.id);
            const apiKey = 'sbAttackPlanCreator'; // api key
            const namespace = 'savebankscriptstw'; // namespace
            try {
                $.getJSON(`${apiUrl}/${namespace}/${apiKey}/up`, response => {
                    if (DEBUG) console.debug(`Total script runs: ${response.count}`);
                }).fail(() => { if (DEBUG) console.debug("Failed to fetch total script runs"); });
            } catch (error) { if (DEBUG) console.debug("Error fetching total script runs: ", error); }

            try {
                $.getJSON(`${apiUrl}/${namespace}/${apiKey}_id${encodedPlayerId}/up`, response => {
                    if (response.count === 1) {
                        $.getJSON(`${apiUrl}/${namespace}/${apiKey}_users/up`).fail(() => {
                            if (DEBUG) console.debug("Failed to increment user count");
                        });
                    }
                    if (DEBUG) console.debug(`Player ${playerId} script runs: ${response.count}`);
                }).fail(() => { if (DEBUG) console.debug("Failed to fetch player script runs"); });
            } catch (error) { if (DEBUG) console.debug("Error fetching player script runs: ", error); }

            try {
                $.getJSON(`${apiUrl}/${namespace}/${apiKey}_users`, response => {
                    if (DEBUG) console.debug(`Total users: ${response.count}`);
                }).fail(() => { if (DEBUG) console.debug("Failed to fetch total users"); });
            } catch (error) { if (DEBUG) console.debug("Error fetching total users: ", error); }
        }

        function getLocalStorage() {
            const localStorageSettings = JSON.parse(localStorage.getItem('sbAttackPlanCreator'));
            // Check if all expected settings are in localStorageSettings
            const expectedSettings = [

            ];

            let missingSettings = [];
            if (localStorageSettings) {
                missingSettings = expectedSettings.filter(setting => !(setting in localStorageSettings));
                if (DEBUG && missingSettings.length > 0) console.debug(`${scriptInfo}: Missing settings in localStorage: `, missingSettings);
            }

            if (localStorageSettings && missingSettings.length === 0) {
                // If settings exist in localStorage  return the object 
                return localStorageSettings;
            } else {
                const defaultSettings = {

                };

                saveLocalStorage(defaultSettings);

                return defaultSettings;
            }
        }

        function saveLocalStorage(settingsObject) {
            // Stringify and save the settings object
            localStorage.setItem('sbAttackPlanCreator', JSON.stringify(settingsObject));
        }
    });

