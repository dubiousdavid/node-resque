"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunPlugin = exports.RunPlugins = void 0;
async function RunPlugins(self, type, func, queue, job, args, pluginCounter) {
    if (!job)
        return true;
    if (!pluginCounter)
        pluginCounter = 0;
    if (job.plugins === null ||
        job.plugins === undefined ||
        job.plugins.length === 0) {
        return true;
    }
    if (pluginCounter >= job.plugins.length)
        return true;
    const pluginRefrence = job.plugins[pluginCounter];
    const toRun = await RunPlugin(self, pluginRefrence, type, func, queue, job, args);
    pluginCounter++;
    if (toRun === false)
        return false;
    return RunPlugins(self, type, func, queue, job, args, pluginCounter);
}
exports.RunPlugins = RunPlugins;
async function RunPlugin(self, PluginRefrence, type, func, queue, job, args) {
    if (!job)
        return true;
    let pluginName = PluginRefrence;
    if (typeof PluginRefrence === "function") {
        pluginName = new PluginRefrence(self, func, queue, job, args, {}).name;
    }
    else if (typeof pluginName === "function") {
        pluginName = pluginName.name;
    }
    let pluginOptions = null;
    if (self.jobs[func].pluginOptions &&
        self.jobs[func].pluginOptions[pluginName]) {
        pluginOptions = self.jobs[func].pluginOptions[pluginName];
    }
    else {
        pluginOptions = {};
    }
    let plugin = null;
    if (typeof PluginRefrence === "string") {
        const PluginConstructor = require(`./../plugins/${PluginRefrence}`)[PluginRefrence];
        plugin = new PluginConstructor(self, func, queue, job, args, pluginOptions);
    }
    else if (typeof PluginRefrence === "function") {
        plugin = new PluginRefrence(self, func, queue, job, args, pluginOptions);
    }
    else {
        throw new Error("Plugin must be the constructor name or an object");
    }
    if (plugin[type] === null ||
        plugin[type] === undefined ||
        typeof plugin[type] !== "function") {
        return true;
    }
    return plugin[type]();
}
exports.RunPlugin = RunPlugin;
