// https://crontab.guru/
module.exports = () => {
    let taskObj = {};

    // Settings
    taskObj.name = 'test';
    taskObj.cron = '* * * * *';
    taskObj.enabled = true;

    // Main function
    taskObj.execute = async () => {
        console.log('This is a test');
    }

    return taskObj;
}