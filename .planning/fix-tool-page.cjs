const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'tool', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace Card import - remove Card, keep CardHeader/Title/Description/Content/Footer, add SpotlightCard
const oldImport = `import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';`;

const newImport = `import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import SpotlightCard from '@/components/ui/spotlight-card';`;

content = content.replace(oldImport, newImport);

// 2. Replace all 4 Card wrappers
const cardOpen = '<Card className="form-card">';
const spotlightOpen = `<SpotlightCard
          className="form-card rounded-xl bg-card text-card-foreground shadow-crowe-sm"
          spotlightColor="rgba(245,168,0,0.08)"
        >`;
content = content.split(cardOpen).join(spotlightOpen);

// 3. Replace all closing </Card> tags
content = content.split('</Card>').join('</SpotlightCard>');

fs.writeFileSync(filePath, content, 'utf8');

const cardCount = (content.match(/<Card /g) || []).length;
const spotlightCount = (content.match(/<SpotlightCard/g) || []).length;
const closeCount = (content.match(/<\/SpotlightCard>/g) || []).length;

console.log('Done!');
console.log('Remaining <Card occurrences:', cardCount);
console.log('SpotlightCard open tags:', spotlightCount);
console.log('SpotlightCard close tags:', closeCount);
