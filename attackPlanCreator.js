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

var allIdsAPC = [
    'groupSelect',
    'originCoordinatesInput',
];

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
            'Origin Villages': 'Origin Villages',
            'Target Villages': 'Target Villages',
            'Time Settings': 'Time Settings',
            'Calculation': 'Calculation',
            'Add Origin Villages:': 'Add Origin Villages:',
            'Add Target Villages:': 'Add Target Villages:',
            'Add Time Settings:': 'Add Time Settings:',
            'Calculate Plan:': 'Calculate Plan:',
            'Result': 'Result',
            'Calculated Plan:': 'Calculated Plan:',
            'Select Group': 'Select Group',
            'Group': 'Group',
            'Coordinates': 'Coordinates',
            'Insert coordinates here': 'Insert coordinates here',
            'Previous': 'Previous',
            'Next': 'Next',
        },
        de_DE: {
            'Can only be used in the village overview or incoming screen!': 'Kann nur im Dorf oder in Eintreffende Befehle verwendet werden!',
            Help: 'Hilfe',
            'Attack Plan Creator': 'Angriffsplanersteller',
            'There was an error!': 'Es gab einen Fehler!',
            'Origin Villages': 'Herkunftsdörfer',
            'Target Villages': 'Zieldörfer',
            'Time Settings': 'Zeiteinstellungen',
            'Calculation': 'Berechnung',
            'Add Origin Villages:': 'Herkunftsdörfer hinzufügen:',
            'Add Target Villages:': 'Zieldörfer hinzufügen:',
            'Add Time Settings:': 'Zeiteinstellungen hinzufügen:',
            'Calculate Plan:': 'Plan berechnen:',
            'Result': 'Ergebnis',
            'Calculated Plan:': 'Berechneter Plan:',
            'Select Group': 'Gruppe auswählen',
            'Group': 'Gruppe',
            'Coordinates': 'Koordinaten',
            'Insert coordinates here': 'Koordinaten hier einfügen',
            'Previous': 'Zurück',
            'Next': 'Weiter',
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
        const isValidMode = twSDK.checkValidLocation('mode');
        if (!isValidScreen && !isValidMode) {
            // Redirect to correct screen if necessary
            UI.InfoMessage(twSDK.tt('Redirecting...'));
            twSDK.redirectTo('overview_villages&combined');
            return;
        }

        const groups = await fetchVillageGroups();

        if (DEBUG) console.debug(`${scriptInfo}: Startup time: ${(performance.now() - startTime).toFixed(2)} milliseconds`);
        // Entry point
        (async function () {
            try {
                const startTime = performance.now();
                renderUI();
                addEventHandlers();
                initializeInputFields();
                // count();
                if (DEBUG) console.debug(`${scriptInfo}: Time to initialize: ${(performance.now() - startTime).toFixed(2)} milliseconds`);
            } catch (error) {
                UI.ErrorMessage(twSDK.tt('There was an error!'));
                console.error(`${scriptInfo}: Error:`, error);
            }
        })();


        function renderUI() {
            const css = generateCSS();
            const groupsFilter = renderGroupsSelect();
            const content = `
            <div id="pageOne" class="ra-mb10" style="display: none;">
                <h3>${twSDK.tt('Origin Villages')}</h3>
                <fieldset>
                    <legend>${twSDK.tt('Add Origin Villages:')}</legend>
                    <div class="sb-grid sb-grid-30-70">
                        <fieldset class="sb-fieldset">
                            <legend>${twSDK.tt('Group')}</legend>
                            ${groupsFilter}
                        </fieldset>
                        <fieldset class="sb-fieldset">
                            <legend id="originCoordinates">${twSDK.tt('Coordinates')}:</legend>
                            <textarea id="originCoordinatesInput" style="width: 100%" class="ra-textarea" placeholder="${twSDK.tt('Insert coordinates here')}"></textarea>
                        </fieldset>
                    </div>
                </fieldset>
            </div>
            <div id="pageTwo" class="ra-mb10" style="display: none;">
                <h3>${twSDK.tt('Target Villages')}</h3>
                <fieldset>
                    <legend>${twSDK.tt('Add Target Villages:')}</legend>
                </fieldset>
            </div> 
            <div id="pageThree" class="ra-mb10" style="display: none;">
                <h3>${twSDK.tt('Time Settings')}</h3>
                <fieldset>
                    <legend>${twSDK.tt('Add Time Settings:')}</legend>
                </fieldset>
            </div>
            <div id="pageFour" class="ra-mb10" style="display: none;">
                <h3>${twSDK.tt('Calculation')}</h3>
                <fieldset>
                    <legend>${twSDK.tt('Calculate Plan:')}</legend>
                </fieldset>
            </div>
            <div id="pageFive" class="ra-mb10" style="display: none;">
                <h3>${twSDK.tt('Result')}</h3>
                <fieldset>
                    <legend>${twSDK.tt('Calculated Plan:')}</legend>
                </fieldset>
            </div>
            <button id="buttonPreviousPage" class="btn">${twSDK.tt('Previous')}</button> 
            <button id="buttonNextPage" class="btn">${twSDK.tt('Next')}</button>
            `;
            twSDK.renderBoxWidget(
                content,
                'sbAttackPlanCreator',
                'sb-attack-plan-creator',
                css
            );
        }

        function generateCSS() {

            let css = `
                    .ui-selected {
                        background-color: #F39814;
                    }
                    .sb-grid-7 {
                        grid-template-columns: repeat(7, 1fr);
                    }
                    .sb-grid-6 {
                        grid-template-columns: repeat(6, 1fr);
                    }
                    .sb-grid-5 {
                        grid-template-columns: repeat(5, 1fr);
                    }
                    .sb-grid-4 {
                        grid-template-columns: repeat(4, 1fr);
                    }
                    .sb-grid-3 {
                        grid-template-columns: repeat(3, 1fr);
                    }
                    .sb-grid-2 {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .sb-grid-20-80 {
                        grid-template-columns: calc(20% - 10px) calc(80% - 10px);
                    }
                    .sb-grid-30-70 {
                        grid-template-columns: calc(30% - 15px) calc(70% - 15px);
                    }
                    .sb-grid-20-60-40-20 {
                        grid-template-columns: calc(15% - 10px) calc(43% - 30px) calc(30% - 20px) calc(12% - 10px);
                    }
                    .sb-grid-17-17-67 {
                        grid-template-columns: calc(17% - 20px) calc(17% - 20px) calc(66% - 40px);
                    }
                    .sb-grid-25-25-50 {
                        grid-template-columns: calc(25% - 5px) calc(25% - 5px) calc(50% - 10px);
                    }
                    .sb-grid {
                        display: grid;
                        grid-gap: 10px;
                    }
                    .sb-grid {
                        display: grid;
                        grid-gap: 10px;
                    }
                    fieldset {
                        border: 1px solid #c1a264;
                        border-radius: 4px;
                        padding: 9px;
                    }
                    legend {
                        font-size: 12px; 
                        font-weight: bold; 
                    }
                    input[type="number"] {
                        padding: 8px;
                        font-size: 14px;
                        border: 1px solid #c1a264;
                        border-radius: 3px;
                        width: 90px;
                    }
                    input[type="checkbox"] {
                        margin-right: 5px;
                        transform: scale(1.2);
                    }
                    input[type="email"] {
                        padding: 8px;
                        font-size: 11px;
                        border: 1px solid #c1a264;
                        border-radius: 3px;
                        width: 100%; 
                    }
                    input[type="email"]::placeholder { 
                        font-style: italic;
                        font-size: 10px;
                    }
                    input[type="number"]::-webkit-inner-spin-button,
                    input[type="number"]::-webkit-outer-spin-button,
                    input[type="number"] {
                        -webkit-appearance: none;
                        margin: 0;
                    }
                    input[type="number"] {
                        -moz-appearance: textfield;
                    }
                    input[type="number"]:focus,
                    input[type="checkbox"]:focus,
                    input[type="email"]:focus {
                        outline: none;
                        border-color: #92794e;
                        box-shadow: 0 0 5px rgba(193, 162, 100, 0.7);
                    }
                    select {
                        padding: 8px;
                        font-size: 14px;
                        border: 1px solid #c1a264;
                        border-radius: 3px;
                        width: 165px;
                    }
                    select:hover {
                        border-color: #92794e; 
                    }
                    
                    select:focus {
                        outline: none;
                        border-color: #92794e; 
                        box-shadow: 0 0 5px rgba(193, 162, 100, 0.7);
                    }

                    .buttonClicked {
                        background-color: grey;
                    }
                    #resetInput {
                        padding: 8px;
                        font-size: 12px;
                        color: white;
                        font-weight: bold;
                        background: #af281d;
                        background: linear-gradient(to bottom, #af281d 0%,#801006 100%);
                        border: 1px solid;
                        border-color: #006712;
                        border-radius: 3px;
                        cursor: pointer;
                        
                    }
                    #resetInput:hover {
                        background: #c92722;
                        background: linear-gradient(to bottom, #c92722 0%,#a00d08 100%);
                    }
            `;

            return css;
        }

        function addEventHandlers() {
            $('#buttonNextPage').on('click', function () {
                const localStorageSettings = getLocalStorage();
                currentPage = parseInt(localStorageSettings.currentPage);
                if (currentPage === 1) {
                    $('#pageOne').hide();
                    $('#pageTwo').show();
                    $('#buttonPreviousPage').prop('disabled', false);
                    localStorageSettings.currentPage = 2;
                } else if (currentPage === 2) {
                    $('#pageTwo').hide();
                    $('#pageThree').show();
                    localStorageSettings.currentPage = 3;
                } else if (currentPage === 3) {
                    $('#pageThree').hide();
                    $('#pageFour').show();
                    localStorageSettings.currentPage = 4;
                } else if (currentPage === 4) {
                    $('#pageFour').hide();
                    $('#pageFive').show();
                    $('#buttonNextPage').prop('disabled', true);
                    localStorageSettings.currentPage = 5;
                }
                saveLocalStorage(localStorageSettings);
            });

            $('#buttonPreviousPage').on('click', function () {
                const localStorageSettings = getLocalStorage();
                currentPage = parseInt(localStorageSettings.currentPage);
                if (currentPage === 5) {
                    $('#pageFive').hide();
                    $('#pageFour').show();
                    $('#buttonNextPage').prop('disabled', false);
                    localStorageSettings.currentPage = 4;
                } else if (currentPage === 4) {
                    $('#pageFour').hide();
                    $('#pageThree').show();
                    localStorageSettings.currentPage = 3;
                } else if (currentPage === 3) {
                    $('#pageThree').hide();
                    $('#pageTwo').show();
                    localStorageSettings.currentPage = 2;
                } else if (currentPage === 2) {
                    $('#pageTwo').hide();
                    $('#pageOne').show();
                    $('#buttonPreviousPage').prop('disabled', true);
                    localStorageSettings.currentPage = 1;
                }
                saveLocalStorage(localStorageSettings);
            });
            $(document).ready(function () {
                allIdsAPC.forEach(function (id) {
                    $('#' + id).on('change', handleInputChange);
                });
            });
        }

        function initializeInputFields() {
            const localStorageSettings = getLocalStorage();
            currentPage = parseInt(localStorageSettings.currentPage);
            if (currentPage === 1) {
                $('#pageOne').show();
                $('#buttonPreviousPage').prop('disabled', true);
            } else if (currentPage === 2) {
                $('#pageTwo').show();
            } else if (currentPage === 3) {
                $('#pageThree').show();
            } else if (currentPage === 4) {
                $('#pageFour').show();
            } else if (currentPage === 5) {
                $('#pageFive').show();
                $('#buttonNextPage').prop('disabled', true);
            }
        }

        function renderGroupsSelect() {
            let groupsFilter = `
		<select name="groupSelect" id="groupSelect">
            <option value="---" selected>
                --- ${twSDK.tt('Select Group')} ---
        </option>
	`;

            for (const [_, group] of Object.entries(groups.result)) {
                const { group_id, name } = group;
                if (name !== undefined) {
                    groupsFilter += `
				<option value="${group_id}">
					${name}
				</option>
			`;
                }
            }

            groupsFilter += `
		</select>
	`;

            return groupsFilter;
        }

        async function fetchVillageGroups() {
            let fetchGroups = '';
            if (game_data.player.sitter > 0) {
                fetchGroups = game_data.link_base_pure + `groups&mode=overview&ajax=load_group_menu&t=${game_data.player.id}`;
            } else {
                fetchGroups = game_data.link_base_pure + 'groups&mode=overview&ajax=load_group_menu';
            }
            const villageGroups = await jQuery.get(fetchGroups).then((response) => response).catch((error) => {
                UI.ErrorMessage('Error fetching village groups!');
                console.error(`${scriptInfo} Error:`, error);
            }
            );

            return villageGroups;
        }

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

        function handleInputChange() {
            const inputId = $(this).attr('id');
            let inputValue;

            switch (inputId) {
                case 'groupSelect':
                    inputValue = $(this).val();
                    break;
                case 'originCoordinatesInput':
                    inputValue = $(this).val();
                    let matchesCoordinates = inputValue.match(twSDK.coordsRegex) || [];
                    inputValue = matchesCoordinates ? matchesCoordinates.join(' ') : '';
                    $(this).val(inputValue);
                    break;
                default:
                    console.error(`${scriptInfo}: Unknown id: ${inputId}`)
            }
            if (DEBUG) console.debug(`${scriptInfo}: ${inputId} changed to ${inputValue}`)
            const settingsObject = getLocalStorage();
            settingsObject[inputId] = inputValue;
            saveLocalStorage(settingsObject);
        }

        function getLocalStorage() {
            const localStorageSettings = JSON.parse(localStorage.getItem('sbAttackPlanCreator'));
            // Check if all expected settings are in localStorageSettings
            const expectedSettings = [
                'currentPage',
                'groupSelect',
                'originCoordinatesInput',
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
                    currentPage: 1,
                    groupSelect: '---',
                    originCoordinatesInput: '',
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

