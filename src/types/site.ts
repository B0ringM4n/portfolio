export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink extends NavItem {
  external: boolean;
}

export interface Technology {
  name: string;
  category: string;
  mark: string;
}

export interface Capability {
  name: string;
  description: string;
}

export interface SiteData {
  identity: {
    name: string;
    role: string;
    location: string;
    timezone: string;
    availability: string;
  };
  seo: {
    title: string;
    description: string;
  };
  copy: {
    skipLink: string;
    menuText: string;
    menuOpenLabel: string;
    menuCloseLabel: string;
    menuOpenStateLabel: string;
    statementHeading: string;
    aboutContactCta: string;
    technologiesHeading: string;
    capabilitiesLabel: string;
    projectsHeading: string;
    projectsJump: string;
    projectsEmpty: string;
    projectsEmptyCta: string;
    projectsCountNoun: string;
    projectLinkLabelPrefix: string;
    projectCapabilitiesLabel: string;
    technologyMarkAltPrefix: string;
    heroScroll: string;
  };
  navigation: NavItem[];
  hero: {
    lines: [string, string, string];
    eyebrow: string;
  };
  statement: string;
  about: {
    label: string;
    lead: string;
    body: string;
  };
  technologies: Technology[];
  capabilities: Capability[];
  contact: {
    lines: [string, string, string];
    email: string;
  };
  socials: SocialLink[];
}
