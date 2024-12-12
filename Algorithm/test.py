from graphviz import Digraph

# Create a UML-compliant Activity Diagram
uml_diagram = Digraph(format="png", name="uml_activity_diagram", graph_attr={"rankdir": "TB"})

# Add Start Node
uml_diagram.node("start", label="", shape="circle", width="0.2", style="filled", fillcolor="black")

# Define the main activities
uml_diagram.node("open_website", label="Open Website", shape="ellipse")
uml_diagram.node("view_posts", label="View Posts", shape="ellipse")
uml_diagram.node("create_post", label="Create Post", shape="ellipse")
uml_diagram.node("like_post", label="Like Post", shape="ellipse")
uml_diagram.node("comment_post", label="Comment Post", shape="ellipse")
uml_diagram.node("view_connections", label="View Connections", shape="ellipse")
uml_diagram.node("swipe", label="Swipe (Left/Right)", shape="ellipse")
uml_diagram.node("view_conversations", label="View Conversations", shape="ellipse")
uml_diagram.node("view_messages", label="View Messages", shape="ellipse")
uml_diagram.node("send_messages", label="Send Messages", shape="ellipse")
uml_diagram.node("view_meetings", label="View Meetings", shape="ellipse")
uml_diagram.node("accept_reject", label="Accept/Reject Meetings", shape="diamond")
uml_diagram.node("send_invitation", label="Send Meeting Invitation", shape="ellipse")
uml_diagram.node("view_threads", label="View Threads", shape="ellipse")
uml_diagram.node("create_thread", label="Create Thread", shape="ellipse")
uml_diagram.node("upvote_downvote", label="Upvote/Downvote Thread", shape="ellipse")
uml_diagram.node("view_notifications", label="View Notifications", shape="ellipse")
uml_diagram.node("my_profile", label="My Profile", shape="ellipse")
uml_diagram.node("edit_profile", label="Edit Profile", shape="ellipse")
uml_diagram.node("logout", label="Logout", shape="ellipse")
uml_diagram.node("end", label="", shape="doublecircle", width="0.2", style="filled", fillcolor="black")

# Add Flows
uml_diagram.edges([
    ("start", "open_website"),
    ("open_website", "view_posts"),
    ("open_website", "view_connections"),
    ("open_website", "view_conversations"),
    ("open_website", "view_meetings"),
    ("open_website", "view_threads"),
    ("open_website", "view_notifications"),
    ("open_website", "my_profile"),
    ("view_posts", "create_post"),
    ("view_posts", "like_post"),
    ("view_posts", "comment_post"),
    ("view_connections", "swipe"),
    ("view_conversations", "view_messages"),
    ("view_conversations", "send_messages"),
    ("view_meetings", "accept_reject"),
    ("accept_reject", "send_invitation"),
    ("view_threads", "create_thread"),
    ("view_threads", "upvote_downvote"),
    ("view_threads", "comment_post"),
    ("my_profile", "edit_profile"),
    ("create_post", "logout"),
    ("like_post", "logout"),
    ("comment_post", "logout"),
    ("send_messages", "logout"),
    ("send_invitation", "logout"),
    ("edit_profile", "logout"),
    ("logout", "end")
])

# Render and save the diagram
uml_diagram_path = "/mnt/data/uml_activity_diagram.png"
uml_diagram.render(uml_diagram_path, format="png", cleanup=True)

uml_diagram_path
