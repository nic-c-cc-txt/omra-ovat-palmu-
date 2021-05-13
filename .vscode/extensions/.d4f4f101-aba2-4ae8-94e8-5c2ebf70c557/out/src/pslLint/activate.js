"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const api_1 = require("./api");
const config_1 = require("./config");
const elementsConventionChecker_1 = require("./elementsConventionChecker");
const methodDoc_1 = require("./methodDoc");
const multiLineDeclare_1 = require("./multiLineDeclare");
const parameters_1 = require("./parameters");
const runtime_1 = require("./runtime");
const tblcolDoc_1 = require("./tblcolDoc");
const todos_1 = require("./todos");
/**
 * Add new rules here to have them checked at the appropriate time.
 */
const componentRules = [];
const fileDefinitionRules = [
    new tblcolDoc_1.TblColDocumentation(),
];
const pslRules = [
    new todos_1.TodoInfo(),
];
const memberRules = [
    new elementsConventionChecker_1.MemberCamelCase(),
    new elementsConventionChecker_1.MemberLength(),
    new elementsConventionChecker_1.MemberStartsWithV(),
    new elementsConventionChecker_1.MemberLiteralCase(),
];
const methodRules = [
    new methodDoc_1.MethodDocumentation(),
    new methodDoc_1.MethodSeparator(),
    new parameters_1.MethodParametersOnNewLine(),
    new runtime_1.RuntimeStart(),
    new multiLineDeclare_1.MultiLineDeclare(),
    new methodDoc_1.TwoEmptyLines(),
];
const propertyRules = [
    new elementsConventionChecker_1.PropertyIsDummy(),
    new elementsConventionChecker_1.PropertyIsDuplicate(),
];
const declarationRules = [];
const parameterRules = [];
function getDiagnostics(profileComponent, parsedDocument, useConfig) {
    const subscription = new RuleSubscription(profileComponent, parsedDocument, useConfig);
    return subscription.reportRules();
}
exports.getDiagnostics = getDiagnostics;
/**
 * Interface for adding and executing rules.
 */
class RuleSubscription {
    constructor(profileComponent, parsedDocument, useConfig) {
        this.profileComponent = profileComponent;
        this.parsedDocument = parsedDocument;
        this.diagnostics = [];
        const config = useConfig ? config_1.getConfig(this.profileComponent.fsPath) : undefined;
        const initializeRules = (rules) => {
            return rules.filter(rule => {
                if (!config)
                    return true;
                return config_1.matchConfig(path.basename(this.profileComponent.fsPath), rule.ruleName, config);
            }).map(rule => {
                rule.profileComponent = this.profileComponent;
                return rule;
            });
        };
        const initializePslRules = (rules) => {
            const componentInitialized = initializeRules(rules);
            const pslParsedDocument = this.parsedDocument;
            return componentInitialized.map(rule => {
                rule.parsedDocument = pslParsedDocument;
                return rule;
            });
        };
        this.componentRules = initializeRules(componentRules);
        this.fileDefinitionRules = initializeRules(fileDefinitionRules);
        this.pslRules = initializePslRules(pslRules);
        this.methodRules = initializePslRules(methodRules);
        this.memberRules = initializePslRules(memberRules);
        this.propertyRules = initializePslRules(propertyRules);
        this.declarationRules = initializePslRules(declarationRules);
        this.parameterRules = initializePslRules(parameterRules);
    }
    reportRules() {
        const addDiagnostics = (rules, ...args) => {
            rules.forEach(rule => this.diagnostics.push(...rule.report(...args)));
        };
        addDiagnostics(this.componentRules);
        if (api_1.ProfileComponent.isFileDefinition(this.profileComponent.fsPath)) {
            addDiagnostics(this.fileDefinitionRules);
        }
        if (api_1.ProfileComponent.isPsl(this.profileComponent.fsPath)) {
            addDiagnostics(this.pslRules);
            const parsedDocument = this.parsedDocument;
            for (const property of parsedDocument.properties) {
                addDiagnostics(this.memberRules, property);
                addDiagnostics(this.propertyRules, property);
            }
            for (const declaration of parsedDocument.declarations) {
                addDiagnostics(this.memberRules, declaration);
                addDiagnostics(this.declarationRules, declaration);
            }
            for (const method of parsedDocument.methods) {
                addDiagnostics(this.memberRules, method);
                addDiagnostics(this.methodRules, method);
                for (const parameter of method.parameters) {
                    addDiagnostics(this.memberRules, parameter);
                    addDiagnostics(this.parameterRules, parameter, method);
                }
                for (const declaration of method.declarations) {
                    addDiagnostics(this.memberRules, declaration);
                    addDiagnostics(this.declarationRules, declaration, method);
                }
            }
        }
        return this.diagnostics;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcHNsTGludC9hY3RpdmF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZCQUE2QjtBQUM3QiwrQkFHZTtBQUNmLHFDQUFrRDtBQU1sRCwyRUFHcUM7QUFDckMsMkNBQWtGO0FBQ2xGLHlEQUFzRDtBQUN0RCw2Q0FBeUQ7QUFDekQsdUNBQXlDO0FBQ3pDLDJDQUFrRDtBQUNsRCxtQ0FBbUM7QUFFbkM7O0dBRUc7QUFDSCxNQUFNLGNBQWMsR0FBMkIsRUFBRSxDQUFDO0FBQ2xELE1BQU0sbUJBQW1CLEdBQXlCO0lBQ2pELElBQUksK0JBQW1CLEVBQUU7Q0FDekIsQ0FBQztBQUNGLE1BQU0sUUFBUSxHQUFjO0lBQzNCLElBQUksZ0JBQVEsRUFBRTtDQUNkLENBQUM7QUFDRixNQUFNLFdBQVcsR0FBaUI7SUFDakMsSUFBSSwyQ0FBZSxFQUFFO0lBQ3JCLElBQUksd0NBQVksRUFBRTtJQUNsQixJQUFJLDZDQUFpQixFQUFFO0lBQ3ZCLElBQUksNkNBQWlCLEVBQUU7Q0FDdkIsQ0FBQztBQUNGLE1BQU0sV0FBVyxHQUFpQjtJQUNqQyxJQUFJLCtCQUFtQixFQUFFO0lBQ3pCLElBQUksMkJBQWUsRUFBRTtJQUNyQixJQUFJLHNDQUF5QixFQUFFO0lBQy9CLElBQUksc0JBQVksRUFBRTtJQUNsQixJQUFJLG1DQUFnQixFQUFFO0lBQ3RCLElBQUkseUJBQWEsRUFBRTtDQUNuQixDQUFDO0FBQ0YsTUFBTSxhQUFhLEdBQW1CO0lBQ3JDLElBQUksMkNBQWUsRUFBRTtJQUNyQixJQUFJLCtDQUFtQixFQUFFO0NBQ3pCLENBQUM7QUFDRixNQUFNLGdCQUFnQixHQUFzQixFQUFFLENBQUM7QUFDL0MsTUFBTSxjQUFjLEdBQW9CLEVBQUUsQ0FBQztBQUUzQyxTQUFnQixjQUFjLENBQzdCLGdCQUFrQyxFQUNsQyxjQUErQixFQUMvQixTQUFtQjtJQUVuQixNQUFNLFlB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