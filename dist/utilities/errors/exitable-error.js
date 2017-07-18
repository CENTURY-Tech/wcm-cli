"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const logger_1 = require("../logger");
class ExitableError extends Error {
    /**
     * Exit with this error
     */
    exit() {
        if (config_1.getDebugEnabled()) {
            logger_1.error("Fatal: %s\n\n%s", this.message, this.stack);
        }
        else {
            logger_1.error("Fatal: %s", this.message);
        }
        return process.exit(1);
    }
    handled() {
        if (config_1.getLogHandledErrors()) {
            if (config_1.getDebugEnabled()) {
                logger_1.error("Handled: %s\n\n%s", this.message, config_1.getDebugEnabled() && this.stack);
            }
            else {
                logger_1.error("Handled: %s", this.message);
            }
        }
    }
}
exports.ExitableError = ExitableError;
