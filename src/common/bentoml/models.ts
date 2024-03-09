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

  export interface ModelSignatureDict {
    batchable?: boolean; // Optional flag for batchability
    batch_dim?: number | [number, number]; // Optional batch dimensions
    input_spec?: any | any[]; // Optional input specification (flexible typing)
    output_spec?: any; // Optional output specification (flexible typing)
  }

//batchable: bool
//batch_dim: t.Union[t.Tuple[int, int], int]
//input_spec: t.Optional[t.Union[t.Tuple[AnyType], AnyType]]
//output_spec: t.Optional[AnyType]

// create function in bentoml cli
    // cls,
    //name: Tag | str,
    //module: str,
    //api_version: str,
    //signatures: ModelSignaturesType,
    //labels: dict[str, str] | None = None,
    //options: ModelOptions | None = None,
    //custom_objects: dict[str, t.Any] | None = None,
    //metadata: dict[str, t.Any] | None = None,
    //context: ModelContext,


  // https://github.com/bentoml/BentoML/blob/064e08759fc4f52ed46ec249208d802031186ac6/src/bentoml/_internal/models/model.py#L183

  export interface ModelInfo {
    tag: string;
    module: string;
    api_version: string;
    signatures: string;
    labels: any[];
    options: any[];
    metadata: string;
    context: string;
    creation_time: string;  }
  
export interface Model {
    name: string;
    model_fs: string;
    model_info: ModelInfo;
    custom_objects: string;
    _internal: boolean;
  }

export interface SimpleModel {
  tag: string;
  module: string;
  size: string;
  creation_time: string;
}

export interface Bento {
  tag: string;
  size: string;
  model_size: string;
  creation_time: string;
}
