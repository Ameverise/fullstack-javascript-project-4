import { Command } from 'commander';
import pageLoader from './index.js';

const runCli = () => {
  const program = new Command();

  program
    .name('page-loader')
    .argument('<url>')
    .option('-o, --output [dir]', 'output directory', process.cwd())
    .action((url, options) => {
      pageLoader(url, options.output)
        .then((filepath) => {
          console.log(`Page successfully saved to ${filepath}`);
        })
        .catch((error) => {
          console.error(error.message);
          process.exit(1);
        });
    });

  program.parse(process.argv);
};

export default runCli;