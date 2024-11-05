const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval;

    if ((interval = Math.floor(seconds / 31536000)) > 1) return `${interval} years ago`;
    if ((interval = Math.floor(seconds / 2592000)) > 1) return `${interval} months ago`;
    if ((interval = Math.floor(seconds / 86400)) > 1) return `${interval} days ago`;
    if ((interval = Math.floor(seconds / 3600)) > 1) return `${interval} hours ago`;
    if ((interval = Math.floor(seconds / 60)) > 1) return `${interval} minutes ago`;
    
    return `${seconds} seconds ago`;
};

export default timeAgo;