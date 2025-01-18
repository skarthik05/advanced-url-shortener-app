export const mockTopicAnalytics = {
    totalClicks: [{ count: 1 }],
    uniqueUsers: [{ count: 1 }],
    clicksByDate: [
        { date: "2025-01-18", clicks: 1 }
    ],
    urls: [
        { shortUrl: "techforum", totalClicks: 1, uniqueUsers: 1 }
    ]
};

export const mockUserAnalytics = {
    totalUrls: 1,
    totalClicks: [{ count: 1 }],
    uniqueUsers: [{ count: 1 }],
    clicksByDate: [
        { date: "2025-01-18", clicks: 5 }
    ],
    osType: [
        {
            osName: "Windows 10.0",
            uniqueClicks: 6,
            uniqueUsers: 2
        }
    ],
    deviceType: [
        {
            deviceName: "Desktop",
            uniqueClicks: 6,
            uniqueUsers: 2
        }
    ]
};

export const mockUrlAnalytics = {
    totalClicks: 7,
    uniqueUsers: 2,
    clicksByDate: [],
    osType: [
        {
            osName: "Windows 10.0",
            uniqueClicks: 4,
            uniqueUsers: 2
        }
    ],
    deviceType: []
};