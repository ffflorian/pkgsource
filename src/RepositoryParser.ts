import urlRegex = require('url-regex');

export class RepositoryParser {
  static cleanRepositoryUrl(repo: string): string {
    return repo.replace(/\.git$/, '').replace(/^.*:\/\//, 'http://');
  }

  static parseRepository(repository: string | Record<string, string>): string | null {
    if (typeof repository === 'string') {
      return RepositoryParser.cleanRepositoryUrl(repository);
    }

    if (!!repository.url) {
      return RepositoryParser.cleanRepositoryUrl(repository.url);
    }

    return null;
  }

  static validateUrl(url: any): boolean {
    if (typeof url !== 'string') {
      return false;
    }

    return urlRegex({exact: true}).test(url);
  }
}
