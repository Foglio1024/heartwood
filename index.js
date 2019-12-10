const path = require('path'); 
class Heartwood
{
    constructor(mod)
    {
        if (mod.region !== 'eu')
        {
            mod.log('This mod only supports EU version of the game.');
            return;
        }
        mod.dispatch.addDefinition('S_COMPLETED_MISSION_INFO', 1, path.join(mod.rootFolder, 'S_COMPLETED_MISSION_INFO.1.def'));
        mod.dispatch.addOpcode('S_COMPLETED_MISSION_INFO', 43612);
        const exclusions = [47957, 50601, 50602, 50603];
        mod.hook('S_COMPLETED_MISSION_INFO', 1, ev =>
        {
            let abort = false;
            // check that all the quests to exclude are already completed
            exclusions.forEach(ex =>
            {
                if (ev.quests.findIndex(q => q.questId === ex) === -1)
                    abort = true;
            });

            // abort if any of them is missing, to avoid quest progression issues
            if (abort)
                return true;

            // build new array with only the quests which are not in exclusions
            const newQuests = [];
            ev.quests.forEach(q =>
            {
                if (exclusions.includes(q.questId))
                    return;
                newQuests.push(q);
            });

            // send the modified array to the client
            mod.send('S_COMPLETED_MISSION_INFO', 1, {
                quests: newQuests
            });

            // block full list
            return false;
        });
    }
}

module.exports = Heartwood;