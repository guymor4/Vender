const OPTION_SOURCE = {
    RECENT_FILES: 'Recent Files',
    START_MENU: 'Start Menu',
    DESKTOP: 'Desktop'
}

const LNK_SOURCES = [
    {
        path: '%PROGRAMDATA%\\Microsoft\\Windows\\Start Menu\\Programs',
        source: OPTION_SOURCE.START_MENU
    },
    {
        path: '%USERPROFILE%\\desktop',
        source: OPTION_SOURCE.DESKTOP
    },
    {
        path: '%PUBLIC%\\desktop',
        source: OPTION_SOURCE.DESKTOP
    },
    {
        path: '%AppData%\\Microsoft\\Windows\\Recent',
        source: OPTION_SOURCE.RECENT_FILES
    }
]