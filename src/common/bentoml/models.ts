export interface IDObject {
    id: string;
  }
  
  export interface Company extends IDObject {}
  
  export interface User extends IDObject {}
  
  export interface Project extends IDObject {}
  
  export interface Queue extends IDObject {}
  
  export interface DataViewEntry {
    // Define the structure of entries if known
  }
  
  export interface Iteration {
    order: string;
    infinite: boolean;
    mix_batch: boolean;
    random_seed: number;
  }
  
  export interface Input {
    view: {
      entries: DataViewEntry[];
    };
    iteration: Iteration;
    dataviews: Record<string, any>;
  }
  
  export interface Execution {
    test_split: number;
    parameters: Record<string, any>;
    model_desc: Record<string, any>;
    model_labels: Record<string, any>;
    dataviews: any[];
    artifacts: any[];
    queue: Queue;
  }
  
  export interface ScriptRequirements {
    org_pip: string;
    pip: string[];
  }
  
  export interface Script {
    binary: string;
    repository: string;
    entry_point: string;
    working_dir: string;
    requirements: ScriptRequirements;
    diff: string;
  }
  
  export interface MetricValue {
    metric: string;
    variant: string;
    value: number;
    min_value: number;
    min_value_iteration: number;
    max_value: number;
    max_value_iteration: number;
  }
  
  export interface MetricStats {
    metric: string;
    event_stats_by_type: Record<string, any>;
  }
  
  export interface LastMetrics {
    [key: string]: Record<string, MetricValue>;
  }
  
  export interface HyperParamValue {
    section: string;
    name: string;
    value: string;
    type: string;
    description: string;
  }
  
  export interface HyperParams {
    [section: string]: Record<string, HyperParamValue>;
  }
  
  export interface Model {
    id: string;
    company: Company;
    user: User;
    name: string;
    type: string;
    status: string;
    status_reason: string;
    status_message: string;
    status_changed: string;
    comment: string;
    report_assets: any[];
    created: string;
    started: string;
    active_duration: number;
    project: Project;
    input: Input;
    output: Record<string, any>;
    execution: Execution;
    tags: any[];
    system_tags: string[];
    script: Script;
    last_worker: string;
    last_worker_report: string;
    last_update: string;
    last_change: string;
    last_iteration: number;
    last_metrics: LastMetrics;
    metric_stats: Record<string, MetricStats>;
    hyperparams: HyperParams;
    configuration: Record<string, any>;
    runtime: Record<string, any>;
    //models: {
    //  input: any[];
    //  output: any[];
    //};
    container: {
      image: string;
      arguments: string;
      setup_shell_script: string;
    };
    last_changed_by: string;
  }