/**
 * Validation script for integration hub files
 * Tests file structure and JSON validity without starting the server
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function validateJSON(filePath, description) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    JSON.parse(data);
    log(`✅ ${description} is valid JSON`, colors.green);
    return true;
  } catch (error) {
    log(`❌ ${description} is invalid JSON: ${error.message}`, colors.red);
    return false;
  }
}

function validateFileExists(filePath, description) {
  try {
    if (fs.existsSync(filePath)) {
      log(`✅ ${description} exists`, colors.green);
      return true;
    } else {
      log(`❌ ${description} not found`, colors.red);
      return false;
    }
  } catch (error) {
    log(`❌ Error checking ${description}: ${error.message}`, colors.red);
    return false;
  }
}

function validateCharacterData() {
  log('\n📋 Validating Character Data Structure', colors.blue);
  try {
    const data = JSON.parse(fs.readFileSync(join(__dirname, 'characters-cleaned.json'), 'utf8'));
    
    const requiredFields = ['characters', 'metadata'];
    const hasRequiredFields = requiredFields.every(field => field in data);
    
    if (hasRequiredFields) {
      log('✅ Character data has required structure', colors.green);
    } else {
      log('❌ Character data missing required fields', colors.red);
      return false;
    }
    
    if (Array.isArray(data.characters) && data.characters.length > 0) {
      log(`✅ Character data contains ${data.characters.length} characters`, colors.green);
      
      // Check first character structure
      const firstChar = data.characters[0];
      const charFields = ['id', 'name', 'archetype', 'prompts'];
      const hasCharFields = charFields.every(field => field in firstChar);
      
      if (hasCharFields) {
        log('✅ Character objects have required fields', colors.green);
      } else {
        log('❌ Character objects missing required fields', colors.red);
        return false;
      }
      
      // Check prompts structure
      if (firstChar.prompts && typeof firstChar.prompts === 'object') {
        const promptTypes = ['hook', 'branding', 'trust'];
        const hasPromptTypes = promptTypes.every(type => type in firstChar.prompts);
        
        if (hasPromptTypes) {
          log('✅ Character prompts have required types', colors.green);
        } else {
          log('❌ Character prompts missing required types', colors.red);
          return false;
        }
      }
    } else {
      log('❌ Character data is empty or not an array', colors.red);
      return false;
    }
    
    return true;
  } catch (error) {
    log(`❌ Error validating character data: ${error.message}`, colors.red);
    return false;
  }
}

function validateIntegrationHub() {
  log('\n📋 Validating Integration Hub Structure', colors.blue);
  try {
    const content = fs.readFileSync(join(__dirname, 'universal-integration-hub.mjs'), 'utf8');
    
    const requiredImports = ['express', 'createServer', 'fs'];
    const hasImports = requiredImports.some(imp => content.includes(imp));
    
    if (hasImports) {
      log('✅ Integration hub has required imports', colors.green);
    } else {
      log('❌ Integration hub missing required imports', colors.red);
      return false;
    }
    
    const requiredEndpoints = [
      '/api/characters',
      '/webhook/shortcuts/search',
      '/api/notion/sync',
      '/health'
    ];
    
    const hasEndpoints = requiredEndpoints.every(endpoint => content.includes(endpoint));
    
    if (hasEndpoints) {
      log('✅ Integration hub has required endpoints', colors.green);
    } else {
      log('❌ Integration hub missing required endpoints', colors.red);
      return false;
    }
    
    return true;
  } catch (error) {
    log(`❌ Error validating integration hub: ${error.message}`, colors.red);
    return false;
  }
}

function validateShortcutsConfig() {
  log('\n📋 Validating Shortcuts Configuration', colors.blue);
  try {
    const data = JSON.parse(fs.readFileSync(join(__dirname, 'example-shortcuts.json'), 'utf8'));
    
    const requiredFields = ['shortcutName', 'actions', 'setupInstructions'];
    const hasRequiredFields = requiredFields.every(field => field in data);
    
    if (hasRequiredFields) {
      log('✅ Shortcuts config has required structure', colors.green);
    } else {
      log('❌ Shortcuts config missing required fields', colors.red);
      return false;
    }
    
    if (Array.isArray(data.actions) && data.actions.length > 0) {
      log(`✅ Shortcuts config contains ${data.actions.length} actions`, colors.green);
    } else {
      log('❌ Shortcuts config has no actions', colors.red);
      return false;
    }
    
    return true;
  } catch (error) {
    log(`❌ Error validating shortcuts config: ${error.message}`, colors.red);
    return false;
  }
}

function validatePackageJson() {
  log('\n📋 Validating Package Configuration', colors.blue);
  try {
    const data = JSON.parse(fs.readFileSync(join(__dirname, 'integration-hub-package.json'), 'utf8'));
    
    const requiredFields = ['name', 'version', 'main', 'scripts'];
    const hasRequiredFields = requiredFields.every(field => field in data);
    
    if (hasRequiredFields) {
      log('✅ Package.json has required structure', colors.green);
    } else {
      log('❌ Package.json missing required fields', colors.red);
      return false;
    }
    
    if (data.scripts && data.scripts.start) {
      log('✅ Package.json has start script', colors.green);
    } else {
      log('❌ Package.json missing start script', colors.red);
      return false;
    }
    
    return true;
  } catch (error) {
    log(`❌ Error validating package.json: ${error.message}`, colors.red);
    return false;
  }
}

function main() {
  log('🧪 Integration Hub Validation', colors.blue);
  log('================================', colors.blue);
  
  let passedTests = 0;
  let failedTests = 0;
  
  // Test file existence
  log('\n📋 Validating File Existence', colors.blue);
  
  if (validateFileExists(join(__dirname, 'characters-cleaned.json'), 'Character data file')) passedTests++; else failedTests++;
  if (validateFileExists(join(__dirname, 'universal-integration-hub.mjs'), 'Integration hub file')) passedTests++; else failedTests++;
  if (validateFileExists(join(__dirname, 'integration-hub-package.json'), 'Package configuration')) passedTests++; else failedTests++;
  if (validateFileExists(join(__dirname, 'example-shortcuts.json'), 'Shortcuts configuration')) passedTests++; else failedTests++;
  if (validateFileExists(join(__dirname, 'INTEGRATION-HUB-README.md'), 'Documentation')) passedTests++; else failedTests++;
  if (validateFileExists(join(__dirname, 'startup-integration-hub.sh'), 'Startup script')) passedTests++; else failedTests++;
  
  // Test JSON validity
  log('\n📋 Validating JSON Structure', colors.blue);
  
  if (validateJSON(join(__dirname, 'characters-cleaned.json'), 'Character data')) passedTests++; else failedTests++;
  if (validateJSON(join(__dirname, 'integration-hub-package.json'), 'Package configuration')) passedTests++; else failedTests++;
  if (validateJSON(join(__dirname, 'example-shortcuts.json'), 'Shortcuts configuration')) passedTests++; else failedTests++;
  
  // Test structure validation
  if (validateCharacterData()) passedTests++; else failedTests++;
  if (validateIntegrationHub()) passedTests++; else failedTests++;
  if (validateShortcutsConfig()) passedTests++; else failedTests++;
  if (validatePackageJson()) passedTests++; else failedTests++;
  
  // Results
  log('\n================================', colors.blue);
  log('🧪 Validation Results', colors.blue);
  log('================================', colors.blue);
  log(`Total tests: ${passedTests + failedTests}`, colors.reset);
  log(`✅ Passed: ${passedTests}`, colors.green);
  log(`❌ Failed: ${failedTests}`, colors.red);
  
  if (failedTests === 0) {
    log('\n🎉 All validation tests passed!', colors.green);
    log('\nNext steps:', colors.yellow);
    log('1. Install dependencies: npm install', colors.reset);
    log('2. Start the server: npm start or ./startup-integration-hub.sh', colors.reset);
    log('3. Run tests: npm test', colors.reset);
    log('4. Access API: http://localhost:3000/api/docs', colors.reset);
  } else {
    log('\n⚠️ Some validation tests failed. Review the errors above.', colors.yellow);
  }
  
  process.exit(failedTests > 0 ? 1 : 0);
}

main();