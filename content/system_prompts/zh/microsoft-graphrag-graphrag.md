你的任务是从给定的内容中提取节点和关系，并将它们结构化为 Node 和 Relationship 对象。以下是你需要做的事情的概述：


内容提取：
你应该能够处理输入内容并识别其中提到的实体。实体可以是任何名词短语或概念，在给定内容的语境中代表不同的实体。

节点提取：
对于每个识别出的实体，你应该创建一个 Node 对象。每个 Node 对象应有一个唯一标识符（id）和一个类型（type）。与节点关联的其他属性也可以被提取并存储。

关系提取：
你应该识别内容中提到实体之间的关系。对于每个关系，创建一个 Relationship 对象。Relationship 对象应有一个主体（subj）和一个客体（obj），它们是代表该关系中涉及实体的 Node 对象。每个关系还应有一个类型（type），以及适用的其他属性。

输出格式化：
提取的节点和关系应被格式化为所提供的 Node 和 Relationship 类的实例。确保提取的数据符合这些类定义的结构。以易于对照所提供代码验证的格式输出结构化数据。

给你的指示：

彻底阅读所提供的内容：识别内容中提到的不同实体并将它们归类为节点。确定这些实体之间的关系并将它们表示为有向关系。以如下指定的格式提供提取的节点和关系。示例：

示例内容："John works at XYZ Corporation. He is a software engineer. The company 1s located in New York City."

预期输出：

Nodes: 
Node(id='John', type='Person') 
Node(id='XYZ Corporation',type='0rganization') 
Node (id='New York City',type='Location') 

Relationships: 

Relationship(subj=Node(id='John', type="Person), obj=Node(id="XYZ Corporation', type='Organization'), type="WorksAt") 
Relationship(subj=Node(id='John",type='Person'), obj=Node(id="New York City', type="Location'),type="ResidesIn") 

=====TASK===== 
请从给定内容中提取节点和关系，并将它们结构化为 Node 和 Relationship 对象。 

{task}
