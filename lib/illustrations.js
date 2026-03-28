// Editorial cartoon SVG illustrations — comic vector style
// Each returns an SVG string matched to article topics

export function getIllustration(headline, verdict) {
  const h = (headline||"").toLowerCase();
  const red = "#CC0000";
  const black = "#1A1A1A";
  const cream = "#F5F0E8";

  // TRADE / ECONOMY / TARIFFS
  if (h.match(/trade|tariff|deficit|economy|gdp|billion|trillion|dollar|tax|budget/)) {
    return `<svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="280" height="160" fill="${cream}"/>
      <line x1="140" y1="18" x2="140" y2="65" stroke="${black}" stroke-width="3" stroke-linecap="round"/>
      <line x1="55" y1="65" x2="225" y2="65" stroke="${black}" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="140" cy="18" r="7" fill="none" stroke="${black}" stroke-width="2.5"/>
      <line x1="72" y1="65" x2="58" y2="108" stroke="${black}" stroke-width="2"/>
      <line x1="72" y1="65" x2="86" y2="108" stroke="${black}" stroke-width="2"/>
      <rect x="38" y="108" width="70" height="26" rx="3" fill="${black}"/>
      <text x="73" y="126" text-anchor="middle" fill="white" font-size="11" font-family="Arial" font-weight="bold">$279B</text>
      <line x1="208" y1="65" x2="194" y2="82" stroke="${black}" stroke-width="2"/>
      <line x1="208" y1="65" x2="222" y2="82" stroke="${black}" stroke-width="2"/>
      <rect x="172" y="82" width="72" height="26" rx="3" fill="${red}"/>
      <text x="208" y="100" text-anchor="middle" fill="white" font-size="11" font-family="Arial" font-weight="bold">$500B??</text>
      <text x="248" y="62" fill="${red}" font-size="28" font-family="Georgia" font-weight="900">?</text>
      <text x="10" y="155" fill="#AAA" font-size="8" font-family="Arial">THE DAILY RECKONING</text>
    </svg>`;
  }

  // NUCLEAR / WEAPONS / MILITARY
  if (h.match(/nuclear|weapon|missile|bomb|military|war|attack|army|troops|force|armed/)) {
    return `<svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="280" height="160" fill="${cream}"/>
      <circle cx="140" cy="75" r="45" fill="none" stroke="${black}" stroke-width="2.5"/>
      <circle cx="140" cy="75" r="28" fill="none" stroke="${black}" stroke-width="2"/>
      <circle cx="140" cy="75" r="10" fill="${black}"/>
      <line x1="140" y1="75" x2="185" y2="30" stroke="${black}" stroke-width="2"/>
      <circle cx="185" cy="30" r="7" fill="none" stroke="${black}" stroke-width="2"/>
      <line x1="140" y1="75" x2="95" y2="120" stroke="${black}" stroke-width="2"/>
      <circle cx="95" cy="120" r="7" fill="none" stroke="${black}" stroke-width="2"/>
      <line x1="140" y1="75" x2="200" y2="95" stroke="${black}" stroke-width="2"/>
      <circle cx="200" cy="95" r="7" fill="none" stroke="${black}" stroke-width="2"/>
      <rect x="110" y="20" width="60" height="22" rx="11" fill="${red}"/>
      <text x="140" y="35" text-anchor="middle" fill="white" font-size="10" font-family="Arial" font-weight="bold">PEACEFUL</text>
      <line x1="125" y1="42" x2="134" y2="53" stroke="${red}" stroke-width="2"/>
      <text x="10" y="155" fill="#AAA" font-size="8" font-family="Arial">THE DAILY RECKONING</text>
    </svg>`;
  }

  // BORDER / IMMIGRATION / WALL
  if (h.match(/border|immigr|wall|migrant|asylum|crossing/)) {
    return `<svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="280" height="160" fill="${cream}"/>
      <rect x="20" y="100" width="240" height="45" fill="${black}"/>
      <rect x="20" y="40" width="240" height="6" rx="2" fill="${black}"/>
      <rect x="38" y="46" width="10" height="54" fill="${black}"/>
      <rect x="68" y="46" width="10" height="54" fill="${black}"/>
      <rect x="98" y="46" width="10" height="54" fill="${black}"/>
      <rect x="128" y="46" width="10" height="54" fill="${black}"/>
      <rect x="158" y="46" width="10" height="54" fill="${black}"/>
      <rect x="188" y="46" width="10" height="54" fill="${black}"/>
      <rect x="218" y="46" width="10" height="54" fill="${black}"/>
      <circle cx="80" cy="25" r="12" fill="none" stroke="${red}" stroke-width="2.5"/>
      <line x1="70" y1="25" x2="90" y2="25" stroke="${red}" stroke-width="2.5"/>
      <text x="105" y="30" fill="${black}" font-size="11" font-family="Arial">MOST DANGEROUS</text>
      <text x="115" y="44" fill="${black}" font-size="11" font-family="Arial">EVER???</text>
      <text x="10" y="155" fill="white" font-size="8" font-family="Arial">THE DAILY RECKONING</text>
    </svg>`;
  }

  // ELECTION / VOTE / DEMOCRACY
  if (h.match(/elect|vote|ballot|democrat|republican|congress|senate|poll|campaign/)) {
    return `<svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="280" height="160" fill="${cream}"/>
      <rect x="85" y="30" width="110" height="90" rx="4" fill="none" stroke="${black}" stroke-width="2.5"/>
      <rect x="115" y="20" width="50" height="20" rx="4" fill="${black}"/>
      <line x1="140" y1="30" x2="140" y2="40" stroke="${black}" stroke-width="2"/>
      <line x1="105" y1="58" x2="175" y2="58" stroke="#CCC" stroke-width="1"/>
      <line x1="105" y1="74" x2="175" y2="74" stroke="#CCC" stroke-width="1"/>
      <line x1="105" y1="90" x2="175" y2="90" stroke="#CCC" stroke-width="1"/>
      <polyline points="105,50 115,60 135,45" fill="none" stroke="${red}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="105" y1="66" x2="145" y2="66" stroke="${black}" stroke-width="2" stroke-linecap="round"/>
      <line x1="105" y1="82" x2="135" y2="82" stroke="${black}" stroke-width="2" stroke-linecap="round"/>
      <text x="10" y="155" fill="#AAA" font-size="8" font-family="Arial">THE DAILY RECKONING</text>
    </svg>`;
  }

  // CLIMATE / ENVIRONMENT
  if (h.match(/climat|environment|green|carbon|emission|energy|oil|fossil|weather/)) {
    return `<svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="280" height="160" fill="${cream}"/>
      <circle cx="140" cy="80" r="55" fill="none" stroke="${black}" stroke-width="2.5"/>
      <ellipse cx="140" cy="80" rx="55" ry="22" fill="none" stroke="${black}" stroke-width="1.5"/>
      <ellipse cx="140" cy="80" rx="22" ry="55" fill="none" stroke="${black}" stroke-width="1.5"/>
      <line x1="85" y1="80" x2="195" y2="80" stroke="${black}" stroke-width="1.5"/>
      <path d="M120,35 Q140,50 160,35" fill="none" stroke="${red}" stroke-width="3" stroke-linecap="round"/>
      <path d="M115,42 Q140,58 165,42" fill="none" stroke="${red}" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
      <text x="10" y="155" fill="#AAA" font-size="8" font-family="Arial">THE DAILY RECKONING</text>
    </svg>`;
  }

  // HEALTH / MEDICINE / COVID
  if (h.match(/health|medic|covid|vaccine|hospital|drug|disease|pandemic|nhs/)) {
    return `<svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="280" height="160" fill="${cream}"/>
      <rect x="115" y="40" width="50" height="80" rx="6" fill="none" stroke="${black}" stroke-width="2.5"/>
      <rect x="105" y="60" width="70" height="40" rx="6" fill="none" stroke="${black}" stroke-width="2.5"/>
      <rect x="133" y="52" width="14" height="56" fill="${red}" opacity="0.9"/>
      <rect x="118" y="72" width="44" height="14" fill="${red}" opacity="0.9"/>
      <circle cx="210" cy="50" r="20" fill="none" stroke="${black}" stroke-width="2"/>
      <line x1="200" y1="40" x2="220" y2="60" stroke="${red}" stroke-width="3" stroke-linecap="round"/>
      <line x1="220" y1="40" x2="200" y2="60" stroke="${red}" stroke-width="3" stroke-linecap="round"/>
      <text x="10" y="155" fill="#AAA" font-size="8" font-family="Arial">THE DAILY RECKONING</text>
    </svg>`;
  }

  // UKRAINE / RUSSIA / WAR / PEACE
  if (h.match(/ukraine|russia|putin|war|peace|ceasefire|nato|invasion|troops|civilian/)) {
    return `<svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="280" height="160" fill="${cream}"/>
      <!-- Olive branch dove outline -->
      <path d="M140,80 C120,60 90,55 75,65 C90,55 95,70 110,72 C95,70 85,80 90,90 C95,100 110,95 120,85 C110,95 115,108 125,108 C135,108 140,95 140,80Z" fill="${black}"/>
      <path d="M140,80 C160,60 190,55 205,65 C190,55 185,70 170,72 C185,70 195,80 190,90 C185,100 170,95 160,85 C170,95 165,108 155,108 C145,108 140,95 140,80Z" fill="${black}"/>
      <circle cx="140" cy="72" r="8" fill="${black}"/>
      <!-- Red X through dove -->
      <line x1="85" y1="45" x2="195" y2="125" stroke="${red}" stroke-width="6" stroke-linecap="round" opacity="0.85"/>
      <line x1="195" y1="45" x2="85" y2="125" stroke="${red}" stroke-width="6" stroke-linecap="round" opacity="0.85"/>
      <text x="10" y="155" fill="#AAA" font-size="8" font-family="Arial">THE DAILY RECKONING</text>
    </svg>`;
  }

  // CHINA / TAIWAN / BEIJING
  if (h.match(/china|beijing|taiwan|xi|ccp|hong kong|tibet/)) {
    return `<svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="280" height="160" fill="${cream}"/>
      <circle cx="140" cy="78" r="52" fill="none" stroke="${black}" stroke-width="2.5"/>
      <line x1="88" y1="78" x2="192" y2="78" stroke="${black}" stroke-width="1.5"/>
      <line x1="140" y1="26" x2="140" y2="130" stroke="${black}" stroke-width="1.5"/>
      <!-- Great wall silhouette -->
      <polyline points="60,105 75,95 82,100 90,88 98,95 108,82 118,90 128,78 140,85 152,73 162,82 172,70 182,78 192,68 202,75 215,65 220,72" fill="none" stroke="${black}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="108" y="25" width="64" height="20" rx="10" fill="${red}"/>
      <text x="140" y="39" text-anchor="middle" fill="white" font-size="9" font-family="Arial" font-weight="bold">PEACEFUL??</text>
      <text x="10" y="155" fill="#AAA" font-size="8" font-family="Arial">THE DAILY RECKONING</text>
    </svg>`;
  }

  // SANCTIONS / ECONOMY SUFFERING
  if (h.match(/sanction|embargo|restrict|ban|punish|pressure|failed|impact/)) {
    return `<svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="280" height="160" fill="${cream}"/>
      <!-- Bar chart going DOWN -->
      <line x1="50" y1="30" x2="50" y2="120" stroke="${black}" stroke-width="2.5"/>
      <line x1="50" y1="120" x2="240" y2="120" stroke="${black}" stroke-width="2.5"/>
      <rect x="65" y="45" width="25" height="75" fill="${black}"/>
      <rect x="105" y="60" width="25" height="60" fill="${black}"/>
      <rect x="145" y="78" width="25" height="42" fill="${black}"/>
      <rect x="185" y="95" width="25" height="25" fill="${red}"/>
      <!-- Arrow going down -->
      <polyline points="75,45 115,60 155,78 197,95" fill="none" stroke="${red}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4,3"/>
      <polygon points="197,83 205,100 189,100" fill="${red}"/>
      <text x="195" y="50" fill="${red}" font-size="11" font-family="Arial" font-weight="bold">ZERO</text>
      <text x="190" y="62" fill="${red}" font-size="11" font-family="Arial" font-weight="bold">IMPACT</text>
      <text x="196" y="74" fill="${red}" font-size="11" font-family="Arial" font-weight="bold">😅</text>
      <text x="10" y="155" fill="#AAA" font-size="8" font-family="Arial">THE DAILY RECKONING</text>
    </svg>`;
  }

  // SPEECH / CLAIMS / PRESS CONFERENCE
  if (h.match(/claim|said|says|state|speech|briefing|announce|declar|assert/)) {
    return `<svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="280" height="160" fill="${cream}"/>
      <!-- Microphone -->
      <rect x="120" y="30" width="40" height="55" rx="20" fill="none" stroke="${black}" stroke-width="3"/>
      <rect x="127" y="37" width="8" height="6" rx="2" fill="${black}"/>
      <rect x="127" y="47" width="8" height="6" rx="2" fill="${black}"/>
      <rect x="127" y="57" width="8" height="6" rx="2" fill="${black}"/>
      <rect x="127" y="67" width="8" height="6" rx="2" fill="${black}"/>
      <rect x="143" y="37" width="8" height="6" rx="2" fill="${black}"/>
      <rect x="143" y="47" width="8" height="6" rx="2" fill="${black}"/>
      <rect x="143" y="57" width="8" height="6" rx="2" fill="${black}"/>
      <rect x="143" y="67" width="8" height="6" rx="2" fill="${black}"/>
      <path d="M100,70 Q100,105 140,105 Q180,105 180,70" fill="none" stroke="${black}" stroke-width="2.5"/>
      <line x1="140" y1="105" x2="140" y2="125" stroke="${black}" stroke-width="2.5"/>
      <line x1="115" y1="125" x2="165" y2="125" stroke="${black}" stroke-width="2.5"/>
      <!-- Speech bubble with X -->
      <path d="M185,20 Q220,20 220,45 Q220,70 185,70 L175,78 L178,70 Q150,70 150,45 Q150,20 185,20Z" fill="${red}"/>
      <line x1="171" y1="32" x2="191" y2="58" stroke="white" stroke-width="3" stroke-linecap="round"/>
      <line x1="191" y1="32" x2="171" y2="58" stroke="white" stroke-width="3" stroke-linecap="round"/>
      <text x="10" y="155" fill="#AAA" font-size="8" font-family="Arial">THE DAILY RECKONING</text>
    </svg>`;
  }

  // CIVILIAN / HUMANITARIAN
  if (h.match(/civilian|humanitarian|hospital|aid|relief|victims|innocen/)) {
    return `<svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="280" height="160" fill="${cream}"/>
      <!-- Shield -->
      <path d="M140,25 L195,45 L195,95 Q195,130 140,148 Q85,130 85,95 L85,45 Z" fill="none" stroke="${black}" stroke-width="3"/>
      <!-- Cross inside shield -->
      <rect x="126" y="60" width="28" height="60" rx="4" fill="${red}"/>
      <rect x="106" y="78" width="68" height="24" rx="4" fill="${red}"/>
      <!-- Crack through shield -->
      <polyline points="155,25 165,60 150,75 162,110 168,148" fill="none" stroke="${red}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
      <text x="10" y="155" fill="#AAA" font-size="8" font-family="Arial">THE DAILY RECKONING</text>
    </svg>`;
  }

  // HUNGER / FOOD / POVERTY
  if (h.match(/hunger|food|poverty|starv|famine|meal|nutrition/)) {
    return `<svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="280" height="160" fill="${cream}"/>
      <circle cx="140" cy="78" r="50" fill="none" stroke="${black}" stroke-width="2.5"/>
      <!-- Fork -->
      <line x1="115" y1="45" x2="115" y2="115" stroke="${black}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="108" y1="45" x2="108" y2="68" stroke="${black}" stroke-width="2" stroke-linecap="round"/>
      <line x1="122" y1="45" x2="122" y2="68" stroke="${black}" stroke-width="2" stroke-linecap="round"/>
      <path d="M108,68 Q115,75 122,68" fill="none" stroke="${black}" stroke-width="2"/>
      <!-- Empty plate -->
      <ellipse cx="155" cy="88" rx="30" ry="8" fill="none" stroke="${black}" stroke-width="2"/>
      <ellipse cx="155" cy="88" rx="20" ry="5" fill="none" stroke="#CCC" stroke-width="1.5"/>
      <!-- Arrow pointing up from plate - empty going up -->
      <line x1="155" y1="65" x2="155" y2="48" stroke="${red}" stroke-width="2.5" stroke-linecap="round"/>
      <polygon points="148,54 155,42 162,54" fill="${red}"/>
      <text x="148" y="40" fill="${red}" font-size="9" font-family="Arial" font-weight="bold">+733M</text>
      <text x="10" y="155" fill="#AAA" font-size="8" font-family="Arial">THE DAILY RECKONING</text>
    </svg>`;
  }

  // OIL / ENERGY / OPEC
  if (h.match(/oil|opec|energy|gas|fuel|barrel|production|saudi/)) {
    return `<svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="280" height="160" fill="${cream}"/>
      <!-- Oil barrel -->
      <ellipse cx="140" cy="48" rx="45" ry="14" fill="${black}"/>
      <rect x="95" y="48" width="90" height="75" fill="${black}"/>
      <ellipse cx="140" cy="123" rx="45" ry="14" fill="#333"/>
      <line x1="95" y1="72" x2="185" y2="72" stroke="${cream}" stroke-width="2.5"/>
      <line x1="95" y1="98" x2="185" y2="98" stroke="${cream}" stroke-width="2.5"/>
      <!-- Dollar sign on barrel -->
      <text x="125" y="92" fill="${cream}" font-size="28" font-family="Georgia" font-weight="900">$</text>
      <!-- Wink -->
      <path d="M195,50 Q215,42 230,50" fill="none" stroke="${red}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="220" cy="62" r="3" fill="${red}"/>
      <text x="10" y="155" fill="#AAA" font-size="8" font-family="Arial">THE DAILY RECKONING</text>
    </svg>`;
  }

  // DEFAULT — megaphone with question mark
  return `<svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg">
    <rect width="280" height="160" fill="${cream}"/>
    <!-- Megaphone -->
    <polygon points="80,58 80,102 112,102 155,128 155,32 112,58" fill="${black}"/>
    <rect x="58" y="68" width="22" height="24" rx="3" fill="${black}"/>
    <path d="M80,80 Q65,80 65,95 Q65,115 80,115" fill="none" stroke="${black}" stroke-width="2.5"/>
    <!-- Sound waves -->
    <path d="M162,55 Q178,80 162,105" fill="none" stroke="${black}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M170,45 Q193,80 170,115" fill="none" stroke="${black}" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
    <!-- Big question mark -->
    <text x="195" y="100" fill="${red}" font-size="55" font-family="Georgia" font-weight="900">?</text>
    <text x="10" y="155" fill="#AAA" font-size="8" font-family="Arial">THE DAILY RECKONING</text>
  </svg>`;
}
