const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval;

    if ((interval = Math.floor(seconds / 31536000)) >= 1) return `${interval} year${interval > 1 ? 's' : ''} ago`;
    if ((interval = Math.floor(seconds / 2592000)) >= 1) return `${interval} month${interval > 1 ? 's' : ''} ago`;
    if ((interval = Math.floor(seconds / 86400)) >= 1) return `${interval} day${interval > 1 ? 's' : ''} ago`;
    if ((interval = Math.floor(seconds / 3600)) >= 1) return `${interval} hour${interval > 1 ? 's' : ''} ago`;
    if ((interval = Math.floor(seconds / 60)) >= 1) return `${interval} minute${interval > 1 ? 's' : ''} ago`;
    
    return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
};

export default timeAgo;