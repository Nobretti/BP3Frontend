//Models
export interface Node {
    id: number;
    name: string;
    type: string;
  }
  
  export interface Edge {
    from: number;
    to: number;
  }
  
  export interface ProcessDiagram {
    nodes: Node[];
    edges: Edge[];
  }
  
  export enum NodeType {
    START_EVENT = 'StartEvent',
    END_EVENT = 'EndEvent',
    HUMAN_TASK = 'HumanTask',
    SERVICE_TASK = 'ServiceTask'
  }