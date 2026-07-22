/**
 * @fileoverview Script to verify traceability sections across all issue files in docs/issues/.
 */

const fs = require('fs');
const path = require('path');

function getIssueFiles(dirPath) {
    if (!fs.existsSync(dirPath)) return [];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    let files = [];
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            files = files.concat(getIssueFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'template.md' && entry.name !== 'README.md') {
            files.push(fullPath);
        }
    }
    return files;
}

function verifyTraceability() {
    const issuesDir = path.resolve(__dirname, '../docs/issues');
    const issueFiles = getIssueFiles(issuesDir);
    let errors = [];

    console.log(`Verifying traceability for ${issueFiles.length} issue file(s)...`);

    for (const file of issueFiles) {
        const relPath = path.relative(path.resolve(__dirname, '..'), file);
        const content = fs.readFileSync(file, 'utf8');

        // Check frontmatter ID
        const idMatch = content.match(/^ID:\s*(\d+)/m);
        if (!idMatch) {
            errors.push(`${relPath}: Missing frontmatter ID.`);
            continue;
        }

        const issueNum = parseInt(idMatch[1], 10);

        // For modern issues (ID >= 80), strictly require Traceability section
        if (issueNum >= 80) {
            if (!/トレーサビリティ|Traceability/i.test(content)) {
                errors.push(`${relPath}: Missing Traceability section.`);
            }
        }
    }

    if (errors.length > 0) {
        console.error('❌ Traceability Verification FAILED:');
        errors.forEach(err => console.error(`  - ${err}`));
        process.exit(1);
    } else {
        console.log('✅ All issue files passed traceability verification.');
        process.exit(0);
    }
}

verifyTraceability();
