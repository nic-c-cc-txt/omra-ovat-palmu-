"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser/parser");
const api_1 = require("./api");
class MethodStartsWithZ extends api_1.MethodRule {
    report(method) {
        const diagnostics = [];
        startsWithZ(method, diagnostics, this.ruleName);
        return diagnostics;
    }
}
exports.MethodStartsWithZ = MethodStartsWithZ;
class PropertyStartsWithZ extends api_1.PropertyRule {
    report(property) {
        const diagnostics = [];
        startsWithZ(property, diagnostics, this.ruleName);
        return diagnostics;
    }
}
exports.PropertyStartsWithZ = PropertyStartsWithZ;
class PropertyIsDummy extends api_1.PropertyRule {
    report(property) {
        const diagnostics = [];
        if (!this.parsedDocument.extending) {
            this.isCalledDummy(property, diagnostics);
        }
        return diagnostics;
    }
    isCalledDummy(member, diagnostics) {
        if (member.id.value.toLowerCase() === 'dummy') {
            diagnostics.push(createDiagnostic(member, 'Usage of "dummy" property is discouraged', api_1.DiagnosticSeverity.Information, this.ruleName));
        }
    }
}
exports.PropertyIsDummy = PropertyIsDummy;
class PropertyIsDuplicate extends api_1.PropertyRule {
    report(property) {
        const diagnostics = [];
        this.isDuplicateProperty(property, diagnostics);
        return diagnostics;
    }
    isDuplicateProperty(property, diagnostics) {
        const slicedProperty = this.parsedDocument.properties.slice(0, this.parsedDocument.properties.findIndex(x => x.id.position.line === property.id.position.line));
        for (const checkProperty of slicedProperty) {
            if (checkProperty.id.value === property.id.value) {
                const diagnostic = new api_1.Diagnostic(property.id.getRange(), `Property "${property.id.value}" is already declared.`, this.ruleName, api_1.DiagnosticSeverity.Warning);
                const aboveDuplicateProperty = new api_1.DiagnosticRelatedInformation(checkProperty.id.getRange(), `Reference to property "${checkProperty.id.value}".`);
                diagnostic.relatedInformation = [
                    aboveDuplicateProperty,
                ];
                diagnostic.source = 'lint';
                diagnostics.push(diagnostic);
                break;
            }
            if (checkProperty.id.value.toLowerCase() === property.id.value.toLowerCase()) {
                const diagnostic = new api_1.Diagnostic(property.id.getRange(), `Property "${property.id.value}" is already declared with different case.`, this.ruleName, api_1.DiagnosticSeverity.Warning);
                const aboveDuplicateProperty = new api_1.DiagnosticRelatedInformation(checkProperty.id.getRange(), `Reference to property "${checkProperty.id.value}".`);
                diagnostic.relatedInformation = [
                    aboveDuplicateProperty,
                ];
                diagnostic.source = 'lint';
                diagnostics.push(diagnostic);
                break;
            }
        }
    }
}
exports.PropertyIsDuplicate = PropertyIsDuplicate;
class MemberLiteralCase extends api_1.MemberRule {
    report(member) {
        const diagnostics = [];
        this.checkUpperCase(member, diagnostics);
        return diagnostics;
    }
    checkUpperCase(member, diagnostics) {
        if ((member.modifiers.findIndex(x => x.value === 'literal') > -1)) {
            if (member.id.value !== member.id.value.toUpperCase()) {
                diagnostics.push(createDiagnostic(member, 'is literal but not upper case.', api_1.DiagnosticSeverity.Warning, this.ruleName));
            }
        }
    }
}
exports.MemberLiteralCase = MemberLiteralCase;
class MemberCamelCase extends api_1.MemberRule {
    report(member) {
        const diagnostics = [];
        this.memberCase(member, diagnostics);
        return diagnostics;
    }
    memberCase(member, diagnostics) {
        const isLiteral = (member.modifiers.findIndex(x => x.value === 'literal') > -1);
        let isStaticDeclaration = false;
        member.types.forEach(type => {
            if (type.value === member.id.value) {
                isStaticDeclaration = true;
            }
        });
        // exception for variables starting with percentage
        if (member.id.value.charAt(0) === '%')
            return;
        // exception for literal properties
        if (isLiteral || isStaticDeclaration)
            return;
        if (member.memberClass === parser_1.MemberClass.method) {
            const method = member;
            if (method.batch)
                return;
        }
        if (member.id.value.charAt(0) > 'z' || member.id.value.charAt(0) < 'a') {
            if (isPublicDeclaration(member)) {
                const diagnostic = new api_1.Diagnostic(member.id.getRange(), `Declaration "${member.id.value}" is public and does not start with lower case.`, this.ruleName, api_1.DiagnosticSeverity.Information);
                diagnostic.source = 'lint';
                diagnostic.member = member;
                diagnostics.push(diagnostic);
            }
            else {
                diagnostics.push(createDiagnostic(member, 'does not start with lowercase.', api_1.DiagnosticSeverity.Warning, this.ruleName));
            }
        }
    }
}
exports.MemberCamelCase = MemberCamelCase;
class MemberLength extends api_1.MemberRule {
    report(member) {
        const diagnostics = [];
        this.checkMemberLength(member, diagnostics);
        return diagnostics;
    }
    checkMemberLength(member, diagnostics) {
        if (member.id.value.length > 25) {
            diagnostics.push(createDiagnostic(member, 'is longer than 25 characters.', api_1.DiagnosticSeverity.Warning, this.ruleName));
        }
    }
}
exports.MemberLength = MemberLength;
class MemberStartsWithV extends api_1.MemberRule {
    report(member) {
        const diagnostics = [];
        this.checkStartsWithV(member, diagnostics);
        return diagnostics;
    }
    checkStartsWithV(member, diagnostics) {
        if (member.id.value.charAt(0) !== 'v')
            return;
        if (isPublicDeclaration(member)) {
            diagnostics.push(createDiagnostic(member, `is public and starts with 'v'.`, api_1.DiagnosticSeverity.Information, this.ruleName));
        }
        else {
            diagnostics.push(createDiagnostic(member, `starts with 'v'.`, api_1.DiagnosticSeverity.Warning, this.ruleName));
        }
    }
}
exports.MemberStartsWithV = MemberStartsWithV;
function createDiagnostic(member, message, diagnosticSeverity, ruleName) {
    const diagnostic = new api_1.Diagnostic(member.id.getRange(), `${printEnum(member.memberClass)} "${member.id.value}" ${message}`, ruleName, diagnosticSeverity);
    diagnostic.source = 'lint';
    diagnostic.member = member;
    return diagnostic;
}
function startsWithZ(member, diagnostics, ruleName) {
    const firstChar = member.id.value.charAt(0);
    if (firstChar === 'z' || firstChar === 'Z') {
        diagnostics.push(createDiagnostic(member, `starts with '${firstChar}'.`, api_1.DiagnosticSeverity.Information, ruleName));
    }
}
function printEnum(memberClass) {
    const enumName = parser_1.MemberClass[memberClass];
    const capitalizedEnumName = enumName.charAt(0).toUpperCase() + enumName.slice(1);
    return enumName === 'method' ? 'Label' : capitalizedEnumName;
}
function isPublicDeclaration(member) {
    const isPublic = member.modifiers.findIndex(x => x.value === 'public') > -1;
    return member.memberClass === parser_1.MemberClass.declaration && isPublic;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudHNDb252ZW50aW9uQ2hlY2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wc2xMaW50L2VsZW1lbnRzQ29udmVudGlvbkNoZWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBeUU7QUFDekUsK0JBR2U7QUFFZixNQUFhLGlCQUFrQixTQUFRLGdCQUFVO0lBRWhELE1BQU0sQ0FBQyxNQUFjO1FBQ3BCLE1BQU0sV0FBVyxHQUFpQixFQUFFLENBQUM7UUFFckMsV0FBVyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRWhELE9BQU8sV0FBVyxDQUFDO0lBQ3BCLENBQUM7Q0FDRDtBQVRELDhDQVNDO0FBQ0QsTUFBYSxtQkFBb0IsU0FBUSxrQkFBWTtJQUVwRCxNQUFNLENBQUMsUUFBa0I7UUFDeEIsTUFBTSxXQUFXLEdBQWlCLEVBQUUsQ0FBQztRQUVyQyxXQUFXLENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFbEQsT0FBTyxXQUFXLENBQUM7SUFDcEIsQ0FBQztDQUNEO0FBVEQsa0RBU0M7QUFFRCxNQUFhLGVBQWdCLFNBQVEsa0JBQVk7SUFFaEQsTUFBTSxDQUFDLFFBQWtCO1FBQ3hCLE1BQU0sV0FBVyxHQUFpQixFQUFFLENBQUM7UUFDckMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFO1lBQ25DLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQzFDO1FBQ0QsT0FBTyxXQUFXLENBQUM7SUFDcEIsQ0FBQztJQUVELGFBQWEsQ0FBQyxNQUFjLEVBQUUsV0FBeUI7UUFDdEQsSUFBSSxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsS0FBSyxPQUFPLEVBQUU7WUFDOUMsV0FBVyxDQUFDLElBQUksQ0FDZixn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