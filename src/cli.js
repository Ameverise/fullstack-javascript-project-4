import { program } from 'commander';
import pageLoader from './index.js';

const runCli = () => {
  program
    .name('page-loader')
    .argument('<url>')
    .option('-o, --output [dir]', 'output directory', process.cwd())
    .parse();

  const { args, opts } = program;

  const url = args[0];
  const { output } = opts();

  pageLoader(url, output)
    .then((filepath) => {
      console.log(`Page successfully saved to ${filepath}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
};

export default runCli;