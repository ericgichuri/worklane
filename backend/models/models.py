from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone, timedelta
from sqlalchemy import Enum as SQLEnum
import enum
import secrets


db = SQLAlchemy()

class PriorityLevel(enum.Enum):
    """Defines the priority level of a request or task."""
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class RequestStatus(enum.Enum):
    """Defines the general status of a customer request."""
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    ON_HOLD = "ON_HOLD"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class TaskStatus(enum.Enum):
    """Defines the current status of a task belonging to a request."""
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    READY = "READY"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class ApprovalStatus(enum.Enum):
    """Defines the status of an approval request."""
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class DocumentType(enum.Enum):
    """Defines the type of document attached to a request."""
    REPORT = "REPORT"
    QUOTATION = "QUOTATION"
    INVOICE = "INVOICE"
    CONTRACT = "CONTRACT"
    OTHER = "OTHER"

class NotificationType(enum.Enum):
    """Defines the type of notification sent to a user."""
    INFO = "INFO"
    TASK = "TASK"
    REQUEST = "REQUEST"
    APPROVAL = "APPROVAL"
    SYSTEM = "SYSTEM"
    WARNING = "WARNING"

class AutomationTrigger(enum.Enum):
    """Defines an event that can trigger an automation rule."""
    REQUEST_CREATED = "REQUEST_CREATED"
    REQUEST_ASSIGNED = "REQUEST_ASSIGNED"
    REQUEST_COMPLETED = "REQUEST_COMPLETED"
    REQUEST_FAILED = "REQUEST_FAILED"
    REQUEST_STATUS_CHANGED = "REQUEST_STATUS_CHANGED"
    TASK_CREATED = "TASK_CREATED"
    TASK_COMPLETED = "TASK_COMPLETED"
    APPROVAL_REQUESTED = "APPROVAL_REQUESTED"
    APPROVAL_APPROVED = "APPROVAL_APPROVED"
    APPROVAL_REJECTED = "APPROVAL_REJECTED"

class AutomationAction(enum.Enum):
    """Defines an action performed when an automation rule is triggered."""
    SEND_NOTIFICATION = "SEND_NOTIFICATION"
    SEND_EMAIL = "SEND_EMAIL"
    CREATE_TASK = "CREATE_TASK"
    GENERATE_DOCUMENT = "GENERATE_DOCUMENT"
    CREATE_ACTIVITY = "CREATE_ACTIVITY"

# ROLE
class Role(db.Model):
    """
    Represents a role within Worklane.
    such as Administrator, Manager, or Employee.
    One role can belong to many users.
    """
    __tablename__ = "roles"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50),nullable=False,unique=True)
    description = db.Column(db.String(255),nullable=True)
    users = db.relationship("User",back_populates="role")

    def __repr__(self):
        return f"<Role {self.name}>"


# USER
class User(db.Model, UserMixin):
    """
    Represents an employee or system user in Worklane.
    """
    __tablename__ = "users"
    id = db.Column(db.Integer,primary_key=True)
    name = db.Column(db.String(100),nullable=False)
    email = db.Column(db.String(100),unique=True,nullable=False)
    phone = db.Column(db.String(20),unique=True,nullable=False)
    password_hash = db.Column(db.String(255),nullable=False)
    role_id = db.Column(db.Integer,db.ForeignKey("roles.id"),nullable=False)
    reset_token = db.Column(db.String(255),unique=True,nullable=True,index=True)
    reset_token_expiration = db.Column(db.DateTime(timezone=True),nullable=True)
    created_at = db.Column(db.DateTime(timezone=True),server_default=db.func.now(),nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True),server_default=db.func.now(),onupdate=db.func.now(),nullable=False)

    # Relationships
    role = db.relationship("Role",back_populates="users")
    created_requests = db.relationship("Request",foreign_keys="Request.created_by",back_populates="creator")
    assigned_requests = db.relationship("Request",foreign_keys="Request.assigned_to",back_populates="assignee")
    assigned_tasks = db.relationship("Task",foreign_keys="Task.assigned_to",back_populates="assignee")
    requested_approvals = db.relationship("Approval",foreign_keys="Approval.requested_by",back_populates="requester")
    approved_approvals = db.relationship("Approval",foreign_keys="Approval.approved_by",back_populates="approver")
    uploaded_documents = db.relationship("Document",back_populates="uploader")
    notifications = db.relationship("Notification",back_populates="user",cascade="all, delete-orphan")
    activity_logs = db.relationship("ActivityLog",back_populates="user")

    @property
    def user_token(self):
        if self.id is None:
            return None
        return f"USR-{self.id:03d}"

    @property
    def password(self):
        raise AttributeError("Plain text password is not readable.")

    @password.setter
    def password(self, plaintext_password):
        self.password_hash = generate_password_hash(plaintext_password)

    def check_password(self, plaintext_password):
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash,plaintext_password)

    # Password reset
    def generate_reset_token(self, expires_in_minutes=15):
        self.reset_token = secrets.token_urlsafe(32)
        self.reset_token_expiration = (
            datetime.now(timezone.utc)
            + timedelta(minutes=expires_in_minutes)
        )
        return self.reset_token

    @staticmethod
    def verify_reset_token(token):
        if not token:
            return None
        user = User.query.filter_by(reset_token=token).first()
        if not user or not user.reset_token_expiration:
            return None

        expiration = user.reset_token_expiration
        if expiration.tzinfo is None:
            expiration = expiration.replace(tzinfo=timezone.utc)

        if expiration < datetime.now(timezone.utc):
            return None

        return user

    def clear_reset_token(self):
        self.reset_token = None
        self.reset_token_expiration = None

    def __repr__(self):
        return f"<User {self.user_token} {self.email}>"


# CUSTOMER
class Customer(db.Model):
    """
    Represents a customer served by a business using Worklane.
    """
    __tablename__ = "customers"
    id = db.Column(db.Integer,primary_key=True)
    name = db.Column(db.String(100),nullable=False)
    email = db.Column(db.String(100),nullable=True)
    phone = db.Column(db.String(20),nullable=False)
    company = db.Column(db.String(100),nullable=True)
    address = db.Column(db.String(255),nullable=True)
    created_at = db.Column(db.DateTime(timezone=True),server_default=db.func.now(),nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True),server_default=db.func.now(),onupdate=db.func.now(),nullable=False)
    requests = db.relationship("Request",back_populates="customer",cascade="all, delete-orphan")

    @property
    def customer_token(self):
        if self.id is None:
            return None

        return f"CUS-{self.id:03d}"

    def __repr__(self):
        return f"<Customer {self.customer_token} {self.name}>"

# REQUEST
class Request(db.Model):
    """
    Represents a request made by a customer.A request is the central piece of work in Worklane.
    """
    __tablename__ = "requests"
    id = db.Column(db.Integer,primary_key=True)
    customer_id = db.Column(db.Integer,db.ForeignKey("customers.id"),nullable=False)
    title = db.Column(db.String(150),nullable=False)
    description = db.Column(db.Text,nullable=True)
    priority = db.Column(SQLEnum(PriorityLevel),default=PriorityLevel.LOW,nullable=False)
    status = db.Column(SQLEnum(RequestStatus),default=RequestStatus.PENDING,nullable=False)
    created_by = db.Column(db.Integer,db.ForeignKey("users.id"),nullable=False)
    assigned_to = db.Column(db.Integer,db.ForeignKey("users.id"),nullable=True)
    due_date = db.Column(db.DateTime(timezone=True),nullable=True)
    on_fail_note = db.Column(db.String(255),nullable=True)
    created_at = db.Column(db.DateTime(timezone=True),server_default=db.func.now(),nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True),server_default=db.func.now(),onupdate=db.func.now(),nullable=False)

    # Relationships
    customer = db.relationship("Customer",back_populates="requests")
    creator = db.relationship("User",foreign_keys=[created_by],back_populates="created_requests")
    assignee = db.relationship("User",foreign_keys=[assigned_to],back_populates="assigned_requests")
    tasks = db.relationship("Task",back_populates="request",cascade="all, delete-orphan")
    workflow = db.relationship("RequestWorkflow",back_populates="request",uselist=False,cascade="all, delete-orphan")
    approvals = db.relationship("Approval",back_populates="request",cascade="all, delete-orphan")
    documents = db.relationship("Document",back_populates="request",cascade="all, delete-orphan")
    activity_logs = db.relationship("ActivityLog",back_populates="request",cascade="all, delete-orphan")

    @property
    def request_no(self):
        if self.id is None:
            return None

        return f"REQ-{self.id:03d}"
    def __repr__(self):
        return f"<Request {self.request_no} {self.title}>"


# TASK
class Task(db.Model):
    """
    Represents a smaller piece of work belonging to a request.
    A request can contain many tasks.
    Each task can be assigned to one user and has its own
    status, priority, deadline, and completion time.
    """
    __tablename__ = "tasks"
    id = db.Column(db.Integer,primary_key=True)
    request_id = db.Column(db.Integer,db.ForeignKey("requests.id"),nullable=False)
    title = db.Column(db.String(150),nullable=False)
    description = db.Column(db.Text,nullable=True)
    assigned_to = db.Column(db.Integer,db.ForeignKey("users.id"),nullable=False)
    status = db.Column(SQLEnum(TaskStatus),default=TaskStatus.PENDING,nullable=False)
    priority = db.Column(SQLEnum(PriorityLevel),default=PriorityLevel.LOW,nullable=False)
    due_date = db.Column(db.DateTime(timezone=True),nullable=True)
    on_fail_note = db.Column(db.String(255),nullable=True)
    created_at = db.Column(db.DateTime(timezone=True),server_default=db.func.now(),nullable=False)
    completed_at = db.Column(db.DateTime(timezone=True),nullable=True)
    updated_at = db.Column(db.DateTime(timezone=True),server_default=db.func.now(),onupdate=db.func.now(),nullable=False)
    request = db.relationship("Request",back_populates="tasks")
    assignee = db.relationship("User",foreign_keys=[assigned_to],back_populates="assigned_tasks")
    @property
    def task_no(self):
        if self.id is None:
            return None
        return f"TSK-{self.id:03d}"

    def __repr__(self):
        return f"<Task {self.task_no} {self.title}>"


# WORKFLOW
class Workflow(db.Model):
    """
    Represents a reusable business workflow.New -> Assigned -> In Progress -> Review -> Completed
    """
    __tablename__ = "workflows"
    id = db.Column(db.Integer,primary_key=True)
    name = db.Column(db.String(100),nullable=False,unique=True)
    description = db.Column(db.Text,nullable=True)
    is_active = db.Column(db.Boolean,default=True,nullable=False)
    stages = db.relationship("WorkflowStage",back_populates="workflow",cascade="all, delete-orphan",order_by="WorkflowStage.stage_order")
    request_workflows = db.relationship("RequestWorkflow",back_populates="workflow")

    @property
    def workflow_token(self):
        if self.id is None:
            return None

        return f"WFL-{self.id:03d}"

    def __repr__(self):
        return f"<Workflow {self.workflow_token} {self.name}>"


# WORKFLOW STAGE
class WorkflowStage(db.Model):
    """
    Represents one stage inside a workflow.
    """
    __tablename__ = "workflow_stages"
    id = db.Column(db.Integer,primary_key=True)
    workflow_id = db.Column(db.Integer,db.ForeignKey("workflows.id"),nullable=False)
    name = db.Column(db.String(100),nullable=False)
    stage_order = db.Column(db.Integer,nullable=False)
    description = db.Column(db.Text,nullable=True)
    workflow = db.relationship("Workflow",back_populates="stages")
    request_workflows = db.relationship("RequestWorkflow",back_populates="current_stage")

    def __repr__(self):
        return f"<WorkflowStage {self.name}>"

# REQUEST WORKFLOW
class RequestWorkflow(db.Model):
    """
    Represents the workflow currently assigned to a request.
    """
    __tablename__ = "request_workflows"
    id = db.Column(db.Integer,primary_key=True)
    request_id = db.Column(db.Integer,db.ForeignKey("requests.id"),nullable=False,unique=True)
    workflow_id = db.Column(db.Integer,db.ForeignKey("workflows.id"),nullable=False)
    current_stage_id = db.Column(db.Integer,db.ForeignKey("workflow_stages.id"),nullable=False)
    request = db.relationship("Request",back_populates="workflow")
    workflow = db.relationship("Workflow",back_populates="request_workflows")
    current_stage = db.relationship("WorkflowStage",back_populates="request_workflows")

    def __repr__(self):
        return f"<RequestWorkflow request={self.request_id}>"

# APPROVAL
class Approval(db.Model):
    """
    Represents an approval request associated with a customer request.
    A user can request an approval and another authorized user
    can approve or reject it.
    """
    __tablename__ = "approvals"
    id = db.Column(db.Integer,primary_key=True)
    request_id = db.Column(db.Integer,db.ForeignKey("requests.id"),nullable=False)
    requested_by = db.Column(db.Integer,db.ForeignKey("users.id"),nullable=False)
    approved_by = db.Column(db.Integer,db.ForeignKey("users.id"),nullable=True)
    status = db.Column(SQLEnum(ApprovalStatus),default=ApprovalStatus.PENDING,nullable=False)
    comments = db.Column(db.Text,nullable=True)
    requested_at = db.Column(db.DateTime(timezone=True),server_default=db.func.now(),nullable=False)
    responded_at = db.Column(db.DateTime(timezone=True),nullable=True)
    request = db.relationship("Request",back_populates="approvals")
    requester = db.relationship("User",foreign_keys=[requested_by],back_populates="requested_approvals")
    approver = db.relationship("User",foreign_keys=[approved_by],back_populates="approved_approvals")

    @property
    def approval_token(self):
        if self.id is None:
            return None
        return f"APR-{self.id:03d}"

    def __repr__(self):
        return f"<Approval {self.approval_token}>"


# DOCUMENT
class Document(db.Model):
    """
    Represents a file attached to a Worklane request.
    """
    __tablename__ = "documents"

    id = db.Column(db.Integer,primary_key=True)
    request_id = db.Column(db.Integer,db.ForeignKey("requests.id"),nullable=False)
    uploaded_by = db.Column(db.Integer,db.ForeignKey("users.id"),nullable=False)
    filename = db.Column(db.String(255),nullable=False)
    filepath = db.Column(db.String(500),nullable=False)
    document_type = db.Column(SQLEnum(DocumentType),default=DocumentType.OTHER,nullable=False)
    uploaded_at = db.Column(db.DateTime(timezone=True),server_default=db.func.now(),nullable=False)
    request = db.relationship("Request",back_populates="documents")
    uploader = db.relationship("User",back_populates="uploaded_documents")
    @property
    def document_token(self):
        if self.id is None:
            return None
        return f"DOC-{self.id:03d}"
    
    def __repr__(self):
        return f"<Document {self.document_token} {self.filename}>"


# NOTIFICATION
class Notification(db.Model):
    """
    Represents a notification sent to a Worklane user.
    """
    __tablename__ = "notifications"
    id = db.Column(db.Integer,primary_key=True)
    user_id = db.Column(db.Integer,db.ForeignKey("users.id"),nullable=False)
    title = db.Column(db.String(100),nullable=False)
    message = db.Column(db.Text,nullable=False)
    type = db.Column(SQLEnum(NotificationType),default=NotificationType.INFO,nullable=False)
    is_read = db.Column(db.Boolean,default=False,nullable=False)
    created_at = db.Column(db.DateTime(timezone=True),server_default=db.func.now(),nullable=False)
    user = db.relationship("User",back_populates="notifications")
    @property
    def notification_token(self):
        if self.id is None:
            return None
        return f"NOT-{self.id:03d}"

    def __repr__(self):
        return f"<Notification {self.notification_token}>"


# ACTIVITY LOG
class ActivityLog(db.Model):
    """
    Represents a historical activity performed on a request.Activity logs provide an audit trail.
    """
    __tablename__ = "activity_logs"
    id = db.Column(db.Integer,primary_key=True)
    user_id = db.Column(db.Integer,db.ForeignKey("users.id"),nullable=False)
    request_id = db.Column(db.Integer,db.ForeignKey("requests.id"),nullable=False)
    action = db.Column(db.String(100),nullable=False)
    description = db.Column(db.Text,nullable=False)
    created_at = db.Column(db.DateTime(timezone=True),server_default=db.func.now(),nullable=False)
    user = db.relationship("User",back_populates="activity_logs")
    request = db.relationship("Request",back_populates="activity_logs")

    @property
    def activity_token(self):
        if self.id is None:
            return None
        return f"ACT-{self.id:03d}"

    def __repr__(self):
        return f"<ActivityLog {self.activity_token}>"

# AUTOMATION RULE
class AutomationRule(db.Model):
    """
    Represents an automated business rule in Worklane.
    An automation rule watches for a specific event and
    performs a predefined action.
    """
    __tablename__ = "automation_rules"
    id = db.Column(db.Integer,primary_key=True)
    name = db.Column(db.String(150),nullable=False)
    trigger = db.Column(SQLEnum(AutomationTrigger),nullable=False)
    action = db.Column(SQLEnum(AutomationAction),nullable=False)
    is_active = db.Column(db.Boolean,default=True,nullable=False)
    created_at = db.Column(db.DateTime(timezone=True),server_default=db.func.now(),nullable=False)
    @property
    def automation_token(self):
        if self.id is None:
            return None
        return f"AUT-{self.id:03d}"

    def __repr__(self):
        return f"<AutomationRule {self.automation_token} {self.name}>"